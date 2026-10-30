#!/usr/bin/env python3
"""
Step 3 - Run the MAMARetrieval evaluation.

TWO STAGES:
Stage A: Retrieval evaluation (primary, quantitative)
Stage B: Generation evaluation (only if context retrieved, records fallback)

Configuration matches production system EXACTLY:
- Embedding: TF-hash 768-dim L2-normalized
- Vector store: SimpleVectorStore (cosine similarity)
- topK: 4
- similarityThreshold: 0.10

Does NOT:
- Bypass the clinical safety blocklist
- Use relevance labels during retrieval
- Modify production data
"""

import json, sys, time, math, re, csv, hashlib
from pathlib import Path
from typing import List, Dict, Optional

BASE_DIR = Path(__file__).resolve().parent.parent
QUERIES_DIR   = BASE_DIR / "queries"
CORPUS_DIR    = BASE_DIR / "corpus"
QRELS_DIR     = BASE_DIR / "qrels"
PROCESSED_DIR = BASE_DIR / "processed"
RESULTS_DIR   = BASE_DIR / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

RESULTS_CSV  = RESULTS_DIR / "query_results.csv"
METRICS_JSON = RESULTS_DIR / "metrics.json"
ERROR_CSV    = RESULTS_DIR / "error_analysis.csv"

TOP_K = 4
SIMILARITY_THRESHOLD = 0.10
DIMS = 768
CHUNK_SIZE = 1400
OVERLAP = 200

# ── Exact TF-hash embedding (same as 02_build_index.py) ──────────────────────
def tf_hash_embed(text: str) -> List[float]:
    vector = [0.0] * DIMS
    parts = re.split(r'[^a-z0-9]+', text.lower())
    for token in parts:
        if len(token) < 3:
            continue
        h = 0
        for ch in token:
            h = (31 * h + ord(ch)) & 0xFFFFFFFF
        if h >= 0x80000000:
            h -= 0x100000000
        bucket = abs(h) % DIMS
        vector[bucket] += 1.0
    norm = math.sqrt(sum(v*v for v in vector))
    if norm > 0:
        vector = [v / norm for v in vector]
    return vector

def cosine_similarity(a, b):
    return sum(x*y for x, y in zip(a, b))

def sha256_hex(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def sliding_window_chunk(text: str):
    chunks = []
    length = len(text)
    start = 0
    while start < length:
        end = min(length, start + CHUNK_SIZE)
        if end < length:
            last_nl = text.rfind('\n', start, end)
            last_sp = text.rfind(' ', start, end)
            boundary = max(last_nl, last_sp)
            if boundary > start + CHUNK_SIZE // 2:
                end = boundary
        chunk_text = text[start:end].strip()
        if chunk_text:
            chunks.append(chunk_text)
        if end >= length:
            break
        start = max(end - OVERLAP, start + 1)
    return chunks

# ── Clinical safety blocklist (exact copy from RagAssistantService.java) ─────
CLINICAL_DECISION_TERMS = [
    "diagnose", "diagnosis", "dosage", "dose",
    "prescribe", "prescription",
    "drug interaction",
    "symptom", "treatment",
    "should i take", "can i take"
]

def is_clinical_decision(query: str) -> bool:
    q = query.lower()
    return any(term in q for term in CLINICAL_DECISION_TERMS)

def log(msg):
    ts = time.strftime("%Y-%m-%dT%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)

# ── In-memory vector index ────────────────────────────────────────────────────
class EvalVectorIndex:
    def __init__(self):
        self.entries = []

    def add(self, text, metadata):
        vec = tf_hash_embed(text)
        self.entries.append({
            "chunk_id": sha256_hex(text)[:16],
            "text": text,
            "metadata": metadata,
            "vector": vec
        })

    def search(self, query, top_k=TOP_K, threshold=SIMILARITY_THRESHOLD):
        q_vec = tf_hash_embed(query)
        scored = []
        for entry in self.entries:
            score = cosine_similarity(q_vec, entry["vector"])
            if score >= threshold:
                scored.append({
                    "chunk_id": entry["chunk_id"],
                    "doc_id": entry["metadata"].get("doc_id", ""),
                    "text": entry["text"],
                    "metadata": entry["metadata"],
                    "score": round(score, 6)
                })
        scored.sort(key=lambda x: -x["score"])
        return scored[:top_k]

    def size(self):
        return len(self.entries)

def build_index_from_corpus(corpus_path: Path) -> EvalVectorIndex:
    index = EvalVectorIndex()
    count = 0
    with open(corpus_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            rec = json.loads(line)
            text = rec.get("text") or rec.get("content") or rec.get("passage") or ""
            if not text or len(text) < 20:
                continue
            doc_id = rec.get("chunk_id") or rec.get("id") or rec.get("doc_id") or f"doc_{count}"
            metadata = {
                "doc_id": doc_id,
                "source": rec.get("source", ""),
                "section": rec.get("section", ""),
                "page": str(rec.get("page", "")),
                "tier": rec.get("tier", ""),
                "benchmark": "mamaretrieval",
                "original_chunk_id": doc_id,
            }
            sub_chunks = sliding_window_chunk(text)
            for i, chunk_text in enumerate(sub_chunks):
                meta = dict(metadata)
                meta["sub_chunk_index"] = i
                index.add(chunk_text, meta)
            count += 1
    log(f"Indexed {count} corpus docs -> {index.size()} chunks")
    return index

def load_queries(queries_path: Path) -> List[Dict]:
    queries = []
    with open(queries_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                queries.append(json.loads(line))
    return queries

def load_qrels(qrels_path: Path) -> Dict[str, Dict[str, int]]:
    """
    Returns {query_id: {chunk_id: score}} where score in {0,1,2}.
    ONLY used AFTER retrieval for metric calculation. NOT used during retrieval.
    """
    qrels = {}
    if not qrels_path.exists():
        return qrels
    with open(qrels_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            rec = json.loads(line)
            qid = rec.get("query_id", "")
            cid = rec.get("chunk_id", "")
            score = int(rec.get("score", 0))
            if qid and cid:
                if qid not in qrels:
                    qrels[qid] = {}
                qrels[qid][cid] = score
    return qrels

def get_relevant_ids(qrels: dict, query_id: str, min_score: int = 1) -> set:
    """Returns set of chunk_ids with score >= min_score for this query."""
    return {cid for cid, sc in qrels.get(query_id, {}).items() if sc >= min_score}

def compute_mrr(retrieved_ids: List[str], relevant_ids: set) -> float:
    for rank, cid in enumerate(retrieved_ids, start=1):
        if cid in relevant_ids:
            return 1.0 / rank
    return 0.0

def get_query_id(q: dict) -> str:
    return q.get("query_id") or q.get("id") or q.get("qid") or ""

def get_query_text(q: dict) -> str:
    return q.get("query_text") or q.get("query") or q.get("text") or ""

def get_seed_chunk_id(q: dict) -> str:
    """The seed chunk is the GROUND TRUTH for per_chunk queries."""
    return q.get("seed_chunk_id") or ""

def run_evaluation(index: EvalVectorIndex, queries: List[Dict], qrels: Dict):
    results = []
    stats = {
        "total": 0, "safety_blocked": 0, "allowed": 0,
        "retrieval_success": 0, "retrieval_miss": 0,
        "no_context": 0, "errors": 0,
        "hit_at_1": 0, "hit_at_4": 0,
        "mrr_sum": 0.0, "mrr_count": 0,
        "recall_at_1_sum": 0.0, "recall_at_4_sum": 0.0,
        "precision_at_1_sum": 0.0, "precision_at_4_sum": 0.0,
        "retrieval_latency_ms_sum": 0.0, "retrieval_latency_ms_list": []
    }

    for q in queries:
        stats["total"] += 1
        qid = get_query_id(q)
        qtext = get_query_text(q)
        seed_cid = get_seed_chunk_id(q)
        split = q.get("split", q.get("tier", ""))
        
        row = {
            "query_id": qid, "split": split, "query": qtext[:300],
            "safety_status": "", "retrieval_status": "",
            "retrieval_latency_ms": "",
            "rank1_doc_id": "", "rank1_chunk_id": "", "rank1_score": "",
            "rank2_doc_id": "", "rank2_chunk_id": "", "rank2_score": "",
            "rank3_doc_id": "", "rank3_chunk_id": "", "rank3_score": "",
            "rank4_doc_id": "", "rank4_chunk_id": "", "rank4_score": "",
            "hit_at_1": "", "hit_at_4": "",
            "relevant_retrieved_count": "", "mrr": "",
            "generation_status": "NOT_ATTEMPTED",
            "generation_latency_ms": "",
            "total_latency_ms": "",
            "answer": "", "source_count": ""
        }

        if not qid or not qtext:
            stats["errors"] += 1
            row["safety_status"] = "ERROR"
            row["retrieval_status"] = "ERROR_NO_QUERY"
            results.append(row)
            continue

        # Layer 1: Safety check (NOT bypassed)
        if is_clinical_decision(qtext):
            stats["safety_blocked"] += 1
            row["safety_status"] = "SAFETY_BLOCKED"
            row["retrieval_status"] = "SAFETY_BLOCKED"
            results.append(row)
            continue

        stats["allowed"] += 1
        row["safety_status"] = "ALLOWED"

        # Layer 2: TF-hash retrieval (same config as production)
        t0 = time.time()
        try:
            retrieved = index.search(qtext, top_k=TOP_K, threshold=SIMILARITY_THRESHOLD)
        except Exception as e:
            stats["errors"] += 1
            row["retrieval_status"] = f"ERROR: {str(e)[:100]}"
            results.append(row)
            continue
        latency_ms = round((time.time() - t0) * 1000, 2)
        stats["retrieval_latency_ms_sum"] += latency_ms
        stats["retrieval_latency_ms_list"].append(latency_ms)
        row["retrieval_latency_ms"] = latency_ms

        if not retrieved:
            stats["retrieval_miss"] += 1
            stats["no_context"] += 1
            row["retrieval_status"] = "NO_RELEVANT_CONTEXT"
            row["generation_status"] = "ABSTAINED_NO_CONTEXT"
            results.append(row)
            continue

        # Fill in retrieved chunks (up to 4)
        for rank_i, res in enumerate(retrieved[:4], start=1):
            row[f"rank{rank_i}_doc_id"]   = res.get("doc_id", "")
            row[f"rank{rank_i}_chunk_id"] = res.get("chunk_id", "")
            row[f"rank{rank_i}_score"]    = res.get("score", "")
        row["source_count"] = len(retrieved)

        retrieved_ids = [r["chunk_id"] for r in retrieved]
        retrieved_doc_ids = [r["doc_id"] for r in retrieved]

        # Determine relevance — ONLY done post-retrieval, never used to guide retrieval
        # For per_chunk queries: ground truth is seed_chunk_id
        # For queries with qrels: use qrel relevant set (score >= 1)
        qrel_relevant = get_relevant_ids(qrels, qid, min_score=1)

        # If we have qrels use them; if not, fall back to seed chunk match
        if qrel_relevant:
            relevant_ids = qrel_relevant
        elif seed_cid:
            # Fallback: the seed chunk is the per-design relevant doc
            # Map seed_cid to sub-chunk: if any retrieved chunk came from same original doc
            relevant_ids = {seed_cid}
        else:
            relevant_ids = set()

        # Compute metrics
        hit1 = int(bool(retrieved_ids[:1] and (retrieved_ids[0] in relevant_ids or retrieved_doc_ids[0] in relevant_ids)))
        hit4 = int(any(cid in relevant_ids for cid in retrieved_ids) or any(did in relevant_ids for did in retrieved_doc_ids[:4]))
        all_relevant = len(relevant_ids) if relevant_ids else 1
        relevant_retrieved = sum(1 for cid in retrieved_ids if cid in relevant_ids)
        # Also count doc-level matches for seed_cid
        if not relevant_retrieved and seed_cid:
            relevant_retrieved = sum(1 for did in retrieved_doc_ids if did == seed_cid)
            if relevant_retrieved:
                hit1 = int(retrieved_doc_ids[0] == seed_cid)
                hit4 = 1

        mrr = compute_mrr(retrieved_ids, relevant_ids)
        if not mrr and seed_cid:
            # Try doc-level MRR
            for rank, did in enumerate(retrieved_doc_ids, start=1):
                if did == seed_cid:
                    mrr = 1.0 / rank
                    break

        row["hit_at_1"] = hit1
        row["hit_at_4"] = hit4
        row["relevant_retrieved_count"] = relevant_retrieved
        row["mrr"] = round(mrr, 6)

        if hit1: stats["hit_at_1"] += 1
        if hit4: stats["hit_at_4"] += 1
        stats["mrr_sum"] += mrr
        stats["mrr_count"] += 1

        # Recall and Precision
        recall_at_1 = min(1.0, relevant_retrieved) / max(1, all_relevant) if retrieved_ids[:1] else 0.0
        recall_at_4 = min(relevant_retrieved, all_relevant) / max(1, all_relevant)
        precision_at_1 = hit1
        precision_at_4 = relevant_retrieved / len(retrieved) if retrieved else 0.0
        stats["recall_at_1_sum"] += recall_at_1
        stats["recall_at_4_sum"] += recall_at_4
        stats["precision_at_1_sum"] += precision_at_1
        stats["precision_at_4_sum"] += precision_at_4

        stats["retrieval_success"] += 1
        row["retrieval_status"] = "RETRIEVAL_SUCCESS"

        # Stage B: Generation — record fallback (no real LLM)
        top_chunk_text = retrieved[0]["text"] if retrieved else ""
        row["generation_status"] = "FALLBACK_NO_LLM"
        row["answer"] = top_chunk_text[:300] + ("..." if len(top_chunk_text) > 300 else "")

        total_ms = latency_ms
        row["total_latency_ms"] = round(total_ms, 2)

        results.append(row)

        if stats["total"] % 100 == 0:
            log(f"  Processed {stats['total']} queries...")

    return results, stats

def compute_metrics(stats: dict, n_allowed: int) -> dict:
    n = max(1, n_allowed)
    lat_list = stats["retrieval_latency_ms_list"]
    lat_list_sorted = sorted(lat_list)
    n_lat = len(lat_list_sorted)

    def pct(x, total):
        return round(x, 6) if isinstance(x, float) else x

    metrics = {
        "benchmark": "MAMARetrieval",
        "version": "v0.1.0",
        "embedding": "TF-hash (VectorStoreConfig.java re-implementation)",
        "embedding_dimension": DIMS,
        "vector_store": "SimpleVectorStore (cosine similarity, in-memory)",
        "similarity": "cosine",
        "normalization": "L2",
        "top_k": TOP_K,
        "similarity_threshold": SIMILARITY_THRESHOLD,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "total_queries": stats["total"],
        "safety_blocked": stats["safety_blocked"],
        "allowed_queries": stats["allowed"],
        "evaluated_queries": stats["retrieval_success"],
        "no_context_queries": stats["no_context"],
        "retrieval_failures": stats["retrieval_miss"],
        "errors": stats["errors"],
        "hit_at_1": round(stats["hit_at_1"] / n, 6) if n > 0 else None,
        "hit_at_4": round(stats["hit_at_4"] / n, 6) if n > 0 else None,
        "mrr": round(stats["mrr_sum"] / max(1, stats["mrr_count"]), 6) if stats["mrr_count"] > 0 else None,
        "recall_at_1": round(stats["recall_at_1_sum"] / n, 6) if n > 0 else None,
        "recall_at_4": round(stats["recall_at_4_sum"] / n, 6) if n > 0 else None,
        "precision_at_1": round(stats["precision_at_1_sum"] / n, 6) if n > 0 else None,
        "precision_at_4": round(stats["precision_at_4_sum"] / n, 6) if n > 0 else None,
        "retrieval_latency_ms_mean": round(sum(lat_list) / n_lat, 2) if n_lat > 0 else None,
        "retrieval_latency_ms_median": round(lat_list_sorted[n_lat//2], 2) if n_lat > 0 else None,
        "retrieval_latency_ms_p95": round(lat_list_sorted[int(0.95*n_lat)], 2) if n_lat > 0 else None,
        "generation_evaluated": False,
        "generation_note": "LLM generation not evaluated: GEMINI_API_KEY not available. Stage B uses top-chunk text fallback only."
    }
    return metrics

def write_results_csv(results, path):
    if not results:
        log("No results to write.")
        return
    fieldnames = list(results[0].keys())
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)
    log(f"Results CSV written: {path} ({len(results)} rows)")

def write_error_analysis(results, path):
    errors = []
    for r in results:
        status = r.get("retrieval_status", "")
        hit4 = r.get("hit_at_4", "")
        mrr = r.get("mrr", "")
        if status in ("NO_RELEVANT_CONTEXT", "SAFETY_BLOCKED") or (hit4 == 0):
            failure_type = "safety_blocked" if status == "SAFETY_BLOCKED" else \
                           "no_context" if status == "NO_RELEVANT_CONTEXT" else \
                           "retrieval_miss"
            errors.append({
                "query_id": r["query_id"],
                "query": r["query"],
                "retrieval_status": status,
                "rank1_score": r.get("rank1_score", ""),
                "rank1_doc_id": r.get("rank1_doc_id", ""),
                "hit_at_1": r.get("hit_at_1", ""),
                "hit_at_4": hit4,
                "mrr": mrr,
                "failure_type": failure_type,
                "possible_reason": "lexical mismatch or low score" if status == "NO_RELEVANT_CONTEXT"
                                   else "clinical safety filter triggered" if status == "SAFETY_BLOCKED"
                                   else "retrieved docs not relevant"
            })
    if errors:
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=list(errors[0].keys()))
            writer.writeheader()
            writer.writerows(errors)
        log(f"Error analysis written: {path} ({len(errors)} rows)")

def main():
    log("MAMARetrieval Benchmark - Run Evaluation (Step 3)")

    corpus_path  = CORPUS_DIR / "corpus.jsonl"
    queries_path = QUERIES_DIR / "queries.jsonl"
    qrels_path   = QRELS_DIR / "qrels.jsonl"

    if not corpus_path.exists():
        log(f"ERROR: Corpus not found: {corpus_path}")
        log("Run 01_download_benchmark.py first.")
        sys.exit(1)

    if not queries_path.exists():
        log(f"ERROR: Queries not found: {queries_path}")
        log("Run 01_download_benchmark.py first.")
        sys.exit(1)

    log("Building evaluation index...")
    index = EvalVectorIndex()
    # Use 02_build_index logic inline
    count = 0
    with open(corpus_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line: continue
            rec = json.loads(line)
            text = rec.get("text") or rec.get("content") or rec.get("passage") or ""
            if not text or len(text) < 20: continue
            doc_id = rec.get("chunk_id") or rec.get("id") or f"doc_{count}"
            meta = {
                "doc_id": doc_id, "source": rec.get("source",""),
                "section": rec.get("section",""), "tier": rec.get("tier",""),
                "benchmark": "mamaretrieval", "original_chunk_id": doc_id
            }
            for i, ch in enumerate(sliding_window_chunk(text)):
                m = dict(meta); m["sub_chunk_index"] = i
                index.add(ch, m)
            count += 1
    log(f"Index built: {index.size()} chunks from {count} corpus docs")

    if index.size() == 0:
        log("ERROR: Index is empty. Cannot evaluate.")
        sys.exit(1)

    log("Loading queries...")
    queries = load_queries(queries_path)
    log(f"Loaded {len(queries)} queries")

    log("Loading qrels (relevance labels - used POST-retrieval only)...")
    qrels = load_qrels(qrels_path)
    log(f"Loaded qrels for {len(qrels)} queries")

    log("Running evaluation (Stage A: Retrieval)...")
    results, stats = run_evaluation(index, queries, qrels)

    log("Writing results...")
    write_results_csv(results, RESULTS_CSV)

    metrics = compute_metrics(stats, stats["allowed"])
    METRICS_JSON.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    log(f"Metrics written: {METRICS_JSON}")

    write_error_analysis(results, ERROR_CSV)

    log("\n" + "="*60)
    log("EVALUATION COMPLETE — ACTUAL RESULTS:")
    log(f"  Total queries:     {metrics['total_queries']}")
    log(f"  Safety blocked:    {metrics['safety_blocked']}")
    log(f"  Allowed:           {metrics['allowed_queries']}")
    log(f"  Retrieval success: {metrics['evaluated_queries']}")
    log(f"  No context:        {metrics['no_context_queries']}")
    log(f"  Errors:            {metrics['errors']}")
    log(f"  Hit@1:             {metrics['hit_at_1']}")
    log(f"  Hit@4:             {metrics['hit_at_4']}")
    log(f"  MRR:               {metrics['mrr']}")
    log(f"  Recall@1:          {metrics['recall_at_1']}")
    log(f"  Recall@4:          {metrics['recall_at_4']}")
    log(f"  Precision@1:       {metrics['precision_at_1']}")
    log(f"  Precision@4:       {metrics['precision_at_4']}")
    lat = metrics.get("retrieval_latency_ms_mean")
    if lat: log(f"  Mean latency:      {lat} ms")
    log("="*60)

if __name__ == "__main__":
    main()
