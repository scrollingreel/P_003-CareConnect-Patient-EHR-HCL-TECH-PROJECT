#!/usr/bin/env python3
"""
Step 1 - Download and prepare the MAMARetrieval benchmark.
Source: https://huggingface.co/datasets/nmrenyi/mamaretrieval
License: Research use only (see dataset card)
"""

import json, os, sys, time, shutil
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR   = BASE_DIR / "raw"
QUERIES_DIR = BASE_DIR / "queries"
CORPUS_DIR  = BASE_DIR / "corpus"
QRELS_DIR   = BASE_DIR / "qrels"
PROCESSED_DIR = BASE_DIR / "processed"

for d in [RAW_DIR, QUERIES_DIR, CORPUS_DIR, QRELS_DIR, PROCESSED_DIR]:
    d.mkdir(parents=True, exist_ok=True)

def log(msg):
    ts = time.strftime("%Y-%m-%dT%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)

def try_load_hf_dataset():
    try:
        from datasets import load_dataset
    except ImportError:
        log("ERROR: 'datasets' library not installed. Run: pip install datasets huggingface_hub")
        return None
    log("Attempting to load nmrenyi/mamaretrieval from HuggingFace...")
    try:
        ds = load_dataset("nmrenyi/mamaretrieval", trust_remote_code=True)
        log(f"SUCCESS: Loaded dataset. Available splits: {list(ds.keys())}")
        return ds
    except Exception as e:
        log(f"FAILED to load dataset: {e}")
        return None

def save_split_as_jsonl(split_data, path):
    count = 0
    with open(path, "w", encoding="utf-8") as f:
        for row in split_data:
            f.write(json.dumps(dict(row), ensure_ascii=False) + "\n")
            count += 1
    log(f"Saved {count} rows -> {path}")
    return count

def inspect_and_save(ds):
    lines = [
        "MAMARetrieval Dataset Schema Inspection Report",
        "=" * 60,
        f"Loaded at: {time.strftime('%Y-%m-%dT%H:%M:%S')}",
        f"Source: https://huggingface.co/datasets/nmrenyi/mamaretrieval",
        f"License: Research use only",
        "",
        f"Splits: {list(ds.keys())}",
    ]
    for split_name, split_data in ds.items():
        lines += ["", f"Split: {split_name}", f"  Rows: {len(split_data)}",
                  f"  Features: {list(split_data.features.keys())}"]
        if len(split_data) > 0:
            row = dict(split_data[0])
            lines.append("  Example row 0:")
            for k, v in row.items():
                vstr = str(v)
                if len(vstr) > 200: vstr = vstr[:200] + "..."
                lines.append(f"    {k}: {vstr}")
        out_path = RAW_DIR / f"{split_name}.jsonl"
        save_split_as_jsonl(split_data, out_path)
        keys = set(split_data.features.keys())
        if "query_text" in keys or "query" in keys:
            shutil.copy(out_path, QUERIES_DIR / "queries.jsonl")
            log(f"  -> Identified as QUERIES, copied to queries/queries.jsonl")
        if "text" in keys and ("chunk_id" in keys or "id" in keys) and "query_text" not in keys:
            shutil.copy(out_path, CORPUS_DIR / "corpus.jsonl")
            log(f"  -> Identified as CORPUS, copied to corpus/corpus.jsonl")
        if "score" in keys and "query_id" in keys and "chunk_id" in keys:
            shutil.copy(out_path, QRELS_DIR / "qrels.jsonl")
            log(f"  -> Identified as QRELS, copied to qrels/qrels.jsonl")
    (PROCESSED_DIR / "schema_report.txt").write_text("\n".join(lines), encoding="utf-8")
    log(f"Schema report written.")
    print("\n".join(lines))

def write_failure_report(error_msg):
    report = f"""MAMARetrieval Download Failure Report
=====================================
Time: {time.strftime('%Y-%m-%dT%H:%M:%S')}
Error: {error_msg}

The dataset is at: https://huggingface.co/datasets/nmrenyi/mamaretrieval
License: Research use only.

To access:
1. Create HuggingFace account
2. Accept dataset terms on the dataset page
3. Run: huggingface-cli login
4. Re-run: python scripts/01_download_benchmark.py

Known stats (from README):
- 3,185 queries (all per_chunk type)
- 78,571 (query, chunk) relevance labels
- Corpus: 63,650 chunks from 19 clinical guideline sources
- Domains: midwifery, obstetrics, neonatal care
- Relevance: D1x(D2+D3) in {{0,1,2}}
"""
    (PROCESSED_DIR / "download_failure_report.txt").write_text(report, encoding="utf-8")
    log(f"Failure report written to processed/download_failure_report.txt")

def main():
    log("MAMARetrieval Benchmark - Download & Preparation Script")
    ds = try_load_hf_dataset()
    if ds is None:
        write_failure_report("Dataset could not be loaded from HuggingFace.")
        log("\nDATASET NOT AVAILABLE. Cannot proceed.")
        sys.exit(1)
    inspect_and_save(ds)
    log("Done. Proceed to 02_build_index.py")

if __name__ == "__main__":
    main()
