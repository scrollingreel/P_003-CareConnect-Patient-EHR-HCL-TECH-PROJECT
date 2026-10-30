#!/usr/bin/env python3
"""
Step 5 (Optional Ablation) - Run ablation experiments with different K and thresholds.
PRIMARY RESULTS ARE NOT MODIFIED by this script.
Results go to results/ablation_results.csv.
"""
import json, csv, math, re, time, sys, hashlib
from pathlib import Path
from typing import List, Dict

BASE_DIR     = Path(__file__).resolve().parent.parent
CORPUS_DIR   = BASE_DIR / "corpus"
QUERIES_DIR  = BASE_DIR / "queries"
QRELS_DIR    = BASE_DIR / "qrels"
RESULTS_DIR  = BASE_DIR / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

DIMS = 768
# PRIMARY config (never changed)
PRIMARY_TOP_K = 4
PRIMARY_THRESHOLD = 0.10

# Ablation sweep configs (SEPARATE from primary)
ABLATION_TOP_KS = [1, 2, 4, 8]
ABLATION_THRESHOLDS = [0.05, 0.10, 0.20]

CLINICAL_DECISION_TERMS = [
    "diagnose","diagnosis","dosage","dose","prescribe","prescription",
    "drug interaction","symptom","treatment","should i take","can i take"
]

def log(msg): print(f"[{time.strftime('%Y-%m-%dT%H:%M:%S')}] {msg}", flush=True)

def tf_hash_embed(text):
    vector = [0.0] * DIMS
    parts = re.split(r'[^a-z0-9]+', text.lower())
    for token in parts:
        if len(token) < 3: continue
        h = 0
        for ch in token:
            h = (31 * h + ord(ch)) & 0xFFFFFFFF
        if h >= 0x80000000: h -= 0x100000000
        bucket = abs(h) % DIMS
        vector[bucket] += 1.0
    norm = math.sqrt(sum(v*v for v in vector))
    if norm > 0: vector = [v/norm for v in vector]
    return vector

def cosine_sim(a, b): return sum(x*y for x, y in zip(a, b))

def sha256_hex(text): return hashlib.sha256(text.encode()).hexdigest()[:16]

def sliding_chunk(text, size=1400, overlap=200):
    chunks, start = [], 0
    length = len(text)
    while start < length:
        end = min(length, start + size)
        if end < length:
            last_nl = text.rfind('\n', start, end)
            last_sp = text.rfind(' ', start, end)
            boundary = max(last_nl, last_sp)
            if boundary > start + size // 2:
                end = boundary
        c = text[start:end].strip()
        if c: chunks.append(c)
        if end >= length:
            break
        start = max(end - overlap, start + 1)
    return chunks

class AblationIndex:
    def __init__(self):
        self.entries = []
    def add(self, text, meta):
        self.entries.append({"chunk_id": sha256_hex(text), "text": text, "meta": meta, "vec": tf_hash_embed(text)})
    def search(self, query, top_k, threshold):
        qv = tf_hash_embed(query)
        scored = [(cosine_sim(qv, e["vec"]), e) for e in self.entries if cosine_sim(qv, e["vec"]) >= threshold]
        scored.sort(key=lambda x: -x[0])
        return [{"chunk_id": e["chunk_id"], "doc_id": e["meta"].get("doc_id",""), "score": round(s,6)} for s, e in scored[:top_k]]

def build_ablation_index(corpus_path):
    idx = AblationIndex()
    count = 0
    with open(corpus_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line: continue
            rec = json.loads(line)
            text = rec.get("text") or rec.get("content") or ""
            if not text or len(text) < 20: continue
            doc_id = rec.get("chunk_id") or rec.get("id") or f"doc_{count}"
            meta = {"doc_id": doc_id, "source": rec.get("source","")}
            for i, ch in enumerate(sliding_chunk(text)):
                m = dict(meta); m["sub_chunk_index"] = i
                idx.add(ch, m)
            count += 1
    log(f"Ablation index: {idx.size()} chunks from {count} docs")
    return idx

def run_ablation_config(idx, queries, qrels, top_k, threshold, config_name):
    hits1, hits4, mrr_sum, total, allowed, blocked = 0, 0, 0.0, 0, 0, 0
    for q in queries:
        total += 1
        qid = q.get("query_id","")
        qtext = q.get("query_text") or q.get("query","")
        seed_cid = q.get("seed_chunk_id","")
        if any(t in qtext.lower() for t in CLINICAL_DECISION_TERMS):
            blocked += 1; continue
        allowed += 1
        retrieved = idx.search(qtext, top_k=top_k, threshold=threshold)
        if not retrieved: continue
        ret_ids = [r["chunk_id"] for r in retrieved]
        ret_doc_ids = [r["doc_id"] for r in retrieved]
        relevant = {cid for cid, sc in qrels.get(qid,{}).items() if sc >= 1}
        if not relevant and seed_cid: relevant = {seed_cid}
        h1 = int(bool(ret_ids and (ret_ids[0] in relevant or ret_doc_ids[0] in relevant)))
        h4 = int(any(cid in relevant for cid in ret_ids) or any(did in relevant for did in ret_doc_ids))
        if not h4 and seed_cid:
            h4 = int(any(did == seed_cid for did in ret_doc_ids))
        hits1 += h1; hits4 += h4
        mrr = 0.0
        for rank, cid in enumerate(ret_ids, 1):
            if cid in relevant: mrr = 1.0/rank; break
        if not mrr and seed_cid:
            for rank, did in enumerate(ret_doc_ids, 1):
                if did == seed_cid: mrr = 1.0/rank; break
        mrr_sum += mrr
    n = max(1, allowed)
    return {
        "config": config_name,
        "top_k": top_k,
        "threshold": threshold,
        "is_primary": (top_k == PRIMARY_TOP_K and threshold == PRIMARY_THRESHOLD),
        "total_queries": total,
        "safety_blocked": blocked,
        "allowed_queries": allowed,
        "hit_at_1": round(hits1/n, 6),
        "hit_at_4": round(hits4/n, 6),
        "mrr": round(mrr_sum/n, 6),
    }

def main():
    log("MAMARetrieval - Ablation Experiment (Step 5)")
    log("NOTE: This does NOT modify primary evaluation results.")

    corpus_path  = CORPUS_DIR / "corpus.jsonl"
    queries_path = QUERIES_DIR / "queries.jsonl"
    qrels_path   = QRELS_DIR / "qrels.jsonl"

    if not corpus_path.exists() or not queries_path.exists():
        log("ERROR: Corpus or queries not found. Run 01_download_benchmark.py first.")
        sys.exit(1)

    log("Building ablation index...")
    idx = build_ablation_index(corpus_path)

    queries = []
    with open(queries_path, encoding="utf-8") as f:
        for line in f:
            if line.strip(): queries.append(json.loads(line))

    qrels = {}
    if qrels_path.exists():
        with open(qrels_path, encoding="utf-8") as f:
            for line in f:
                if not line.strip(): continue
                rec = json.loads(line)
                qid, cid, score = rec.get("query_id",""), rec.get("chunk_id",""), int(rec.get("score",0))
                if qid and cid:
                    qrels.setdefault(qid, {})[cid] = score

    results = []
    for top_k in ABLATION_TOP_KS:
        for threshold in ABLATION_THRESHOLDS:
            config_name = f"K{top_k}_T{threshold}"
            is_primary = (top_k == PRIMARY_TOP_K and threshold == PRIMARY_THRESHOLD)
            label = "PRIMARY" if is_primary else "ABLATION"
            log(f"Running {label}: K={top_k}, threshold={threshold}")
            result = run_ablation_config(idx, queries, qrels, top_k, threshold, config_name)
            results.append(result)
            log(f"  Hit@1={result['hit_at_1']:.4f}, Hit@{top_k}={result['hit_at_4']:.4f}, MRR={result['mrr']:.4f}")

    ablation_path = RESULTS_DIR / "ablation_results.csv"
    fieldnames = list(results[0].keys())
    with open(ablation_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)
    log(f"Ablation results written: {ablation_path}")
    log("Ablation complete. Primary results in results/metrics.json are UNCHANGED.")

if __name__ == "__main__":
    main()
