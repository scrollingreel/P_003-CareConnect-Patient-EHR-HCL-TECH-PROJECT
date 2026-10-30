#!/usr/bin/env python3
"""
Step 2 - Build an ISOLATED evaluation vector index from MAMARetrieval corpus.

IMPORTANT:
- This uses the SAME TF-hash embedding algorithm as the production system (VectorStoreConfig.java)
- But in an ISOLATED Python re-implementation so we do not contaminate the H2 production DB
- The hospital production knowledge base is NOT touched
- Chunk text goes through the same 1400-char/200-overlap chunker
"""

import json, os, sys, time, hashlib, math
from pathlib import Path
from typing import List, Dict, Tuple

BASE_DIR = Path(__file__).resolve().parent.parent
CORPUS_DIR   = BASE_DIR / "corpus"
PROCESSED_DIR = BASE_DIR / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

INDEX_PATH = PROCESSED_DIR / "eval_index.jsonl"
CHUNK_LOG_PATH = PROCESSED_DIR / "chunk_stats.json"

# --- EXACT COPY of Java VectorStoreConfig.java TF-hash embedding ---
DIMS = 768
CHUNK_SIZE = 1400
OVERLAP = 200

def log(msg):
    ts = time.strftime("%Y-%m-%dT%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)

def tf_hash_embed(text: str) -> List[float]:
    """
    Python re-implementation of VectorStoreConfig.java TF-hash EmbeddingModel.
    Tokenize on non-alphanumeric, skip tokens < 3 chars,
    hash each token to a 768-dim bucket, L2-normalize.
    """
    vector = [0.0] * DIMS
    tokens = [t for t in text.lower().split() if len(t) >= 3]
    # Refine: split on non-alnum
    refined = []
    for token in tokens:
        # Split on non-alphanumeric characters
        import re
        parts = re.split(r'[^a-z0-9]+', token.lower())
        for p in parts:
            if len(p) >= 3:
                refined.append(p)
    for token in refined:
        # Java String.hashCode() equivalent
        h = 0
        for ch in token:
            h = (31 * h + ord(ch)) & 0xFFFFFFFF
        # Convert to signed int32
        if h >= 0x80000000:
            h -= 0x100000000
        bucket = abs(h) % DIMS
        vector[bucket] += 1.0
    # L2 normalize
    norm = math.sqrt(sum(v*v for v in vector))
    if norm > 0:
        vector = [v / norm for v in vector]
    return vector

def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Cosine similarity between two L2-normalized vectors."""
    return sum(x*y for x, y in zip(a, b))

def sha256_hex(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def sliding_window_chunk(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = OVERLAP):
    """
    Python re-implementation of KnowledgeDocumentService.java split().
    Word-boundary aware sliding window chunker.
    """
    chunks = []
    length = len(text)
    start = 0
    while start < length:
        end = min(length, start + chunk_size)
        if end < length:
            last_nl = text.rfind('\n', start, end)
            last_sp = text.rfind(' ', start, end)
            boundary = max(last_nl, last_sp)
            if boundary > start + chunk_size // 2:
                end = boundary
        chunk_text = text[start:end].strip()
        if chunk_text:
            chunks.append(chunk_text)
        if end >= length:
            break
        start = max(end - overlap, start + 1)
    return chunks

class EvalVectorIndex:
    """
    Isolated in-memory vector index for benchmark evaluation.
    Mirrors SimpleVectorStore behavior.
    Does NOT interact with production H2 or Spring Boot.
    """
    def __init__(self):
        self.entries = []  # list of {chunk_id, doc_id, text, metadata, vector}

    def add(self, text: str, metadata: dict):
        vec = tf_hash_embed(text)
        entry = {
            "chunk_id": sha256_hex(text)[:16],
            "text": text,
            "metadata": metadata,
            "vector": vec
        }
        self.entries.append(entry)
        return entry["chunk_id"]

    def search(self, query: str, top_k: int = 4, threshold: float = 0.10) -> List[Dict]:
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
                    "score": score
                })
        scored.sort(key=lambda x: -x["score"])
        return scored[:top_k]

    def size(self):
        return len(self.entries)

    def save_index(self, path: Path):
        """Save index without vectors (for inspection). Vectors re-computed on load."""
        with open(path, "w", encoding="utf-8") as f:
            for entry in self.entries:
                rec = {
                    "chunk_id": entry["chunk_id"],
                    "doc_id": entry["metadata"].get("doc_id", ""),
                    "text_len": len(entry["text"]),
                    "metadata": entry["metadata"]
                }
                f.write(json.dumps(rec, ensure_ascii=False) + "\n")
        log(f"Index manifest saved: {path} ({self.size()} chunks)")

    def load_and_rebuild(self, corpus_path: Path):
        """Load corpus and rebuild index in-memory."""
        if not corpus_path.exists():
            log(f"ERROR: Corpus not found at {corpus_path}")
            return False
        count = 0
        with open(corpus_path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                rec = json.loads(line)
                # Determine text field
                text = rec.get("text") or rec.get("content") or rec.get("passage") or ""
                if not text or len(text) < 20:
                    continue
                doc_id = rec.get("chunk_id") or rec.get("id") or rec.get("doc_id") or f"doc_{count}"
                metadata = {
                    "doc_id": doc_id,
                    "source": rec.get("source", ""),
                    "section": rec.get("section", ""),
                    "page": rec.get("page", ""),
                    "tier": rec.get("tier", ""),
                    "breadcrumb": rec.get("breadcrumb", ""),
                    "benchmark": "mamaretrieval",
                    "original_chunk_id": doc_id,
                }
                # Apply same chunker as production system
                sub_chunks = sliding_window_chunk(text)
                for i, chunk_text in enumerate(sub_chunks):
                    meta = dict(metadata)
                    meta["sub_chunk_index"] = i
                    meta["total_sub_chunks"] = len(sub_chunks)
                    self.add(chunk_text, meta)
                count += 1
        log(f"Indexed {count} corpus documents -> {self.size()} chunks in eval index")
        return True


def main():
    log("MAMARetrieval Benchmark - Build Evaluation Index (Step 2)")

    corpus_path = CORPUS_DIR / "corpus.jsonl"
    if not corpus_path.exists():
        log(f"ERROR: corpus.jsonl not found at {corpus_path}")
        log("Please run 01_download_benchmark.py first.")
        sys.exit(1)

    index = EvalVectorIndex()
    success = index.load_and_rebuild(corpus_path)

    if not success or index.size() == 0:
        log("ERROR: Index is empty. Check corpus.jsonl content.")
        sys.exit(1)

    index.save_index(INDEX_PATH)

    stats = {
        "corpus_path": str(corpus_path),
        "index_path": str(INDEX_PATH),
        "total_chunks_indexed": index.size(),
        "embedding": "TF-hash",
        "embedding_dimension": DIMS,
        "chunk_size": CHUNK_SIZE,
        "overlap": OVERLAP,
        "normalization": "L2",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "note": "Isolated from production hospital knowledge base"
    }
    CHUNK_LOG_PATH.write_text(json.dumps(stats, indent=2), encoding="utf-8")
    log(f"Index stats: {json.dumps(stats, indent=2)}")
    log("Step 2 complete. Proceed to 03_run_evaluation.py")

if __name__ == "__main__":
    main()
