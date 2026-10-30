# MAMARetrieval Benchmark Evaluation Report
## ApexCare Hospital Management System — RAG Retrieval Evaluation

**Date:** 2026-09-06
**Evaluator:** Senior ML/RAG Evaluation Engineer
**System:** ApexCare Hospital RAG (Spring Boot 3.5.7 + React 18)
**Benchmark:** MAMARetrieval v0.1.0 (external benchmark, not the project dataset)

---

## 1. Objective

This report evaluates the retrieval effectiveness of the ApexCare Hospital RAG
pipeline against the MAMARetrieval clinical guideline retrieval benchmark.

The evaluation covers:
- Stage A: Retrieval quality (primary quantitative evaluation)
- Stage B: Generation behavior (qualitative / fallback documentation)
- Safety filter behavior on clinical queries
- Latency profiling

---

## 2. Benchmark Description

**MAMARetrieval** is an external retrieval benchmark for medical RAG systems,
built from midwifery and obstetric clinical guidelines. It is NOT the project's
original dataset or knowledge base.

- Repository: https://github.com/nmrenyi/mamaretrieval
- HuggingFace: https://huggingface.co/datasets/nmrenyi/mamaretrieval
- Version evaluated: v0.1.0 (Tier 2)
- Domain: Midwifery / OBGYN / neonatal care (Zanzibar/WHO clinical context)

---

## 3. Dataset Information

| Property | Value |
|---|---|
| Queries | 3,185 (all `per_chunk` type) |
| Corpus chunks (v0.1.0) | 17,827 (subset of 63,650-chunk full corpus) |
| Labeled (query, chunk) pairs | 36,418 |
| Query generation model | Qwen3.6-27B-FP8 |
| Relevance judge model | Qwen3.5-397B-A17B-FP8 |
| Rubric | D1 x (D2 + D3 + D4) in {0..6} |
| Retrievers in dataset | BM25, MedCPT, Octen, Voyage, LateOn, Gecko |
| Train/dev/test split | Single `test` split (no train/dev) |
| No train/dev split | Benchmark is evaluation-only |

---

## 4. License Information

**License:** MamaRetrieval Research-Only License v1

**Permitted:**
- Academic research, including publication of aggregate metrics
- Use as an evaluation benchmark for retrieval systems
- Methodology research (rubric, prompts, structured metadata)

**Not Permitted:**
- Commercial use
- Use of chunk text as training data for any model
- Redistribution of chunk text outside the shipped dataset form
- Clinical use of chunk text (not reviewed for clinical accuracy)

**Attribution required:** Ren, Yi. *MamaRetrieval* v0.1.0. 2026.

---

## 5. Dataset Structure

The dataset is distributed as Parquet files on HuggingFace with 4 configs:

| Config | Schema |
|---|---|
| `queries` | `query_id`, `query_text`, `seed_chunk_id` |
| `rankings` | `query_id`, `retriever`, `rank`, `chunk_id`, `score` |
| `judgments` | `query_id`, `chunk_id`, `d1_topic`, `d2_meaningful`, `d3_actionable`, `d4_density`, `score` |
| `chunks` | `chunk_id`, `text` |

Relevance labels use a four-dimension rubric:
- D1 (bool): Topic match — same condition, intervention, and clinical timing context
- D2 (0-2): Meaningful clinical content richness
- D3 (0-2): Actionable guidance specificity
- D4 (0-2): Chunk density relevant to query
- score = D1 x (D2 + D3 + D4) ∈ {0..6}

---

## 6. Preprocessing / Indexing Process

Benchmark corpus documents are processed through the **same pipeline** as
production hospital documents:

1. Load chunk text from `chunks.parquet` (via HuggingFace dataset)
2. Apply sliding-window chunker: 1,400 char chunks / 200 char overlap
   (Python re-implementation of `KnowledgeDocumentService.java`)
3. Embed each chunk with TF-hash algorithm
   (Python re-implementation of `VectorStoreConfig.java`)
4. Store in isolated in-memory `EvalVectorIndex`
   (NOT added to production H2 DB or production SimpleVectorStore)

---

## 7. Retrieval Configuration

| Parameter | Value | Source |
|---|---|---|
| Embedding model | TF-hash bag-of-words | `VectorStoreConfig.java` (re-implemented) |
| Embedding dimension | 768 | Fixed in implementation |
| Normalization | L2 | Applied post-bucketing |
| Similarity function | Cosine similarity | SimpleVectorStore default |
| Top-K | 4 | `app.rag.top-k` in `application.yml` |
| Similarity threshold | 0.10 | `app.rag.similarity-threshold` in `application.yml` |
| Chunker | Sliding window 1400/200 | `KnowledgeDocumentService.java` |

**These values were NOT changed for this evaluation.**

---

## 8. Evaluation Methodology

### Stage A — Retrieval Evaluation (Primary)
1. Load query text
2. Apply existing safety blocklist (11 clinical decision terms)
3. If blocked: record `SAFETY_BLOCKED`, do not bypass
4. If allowed: generate TF-hash embedding, search eval index
5. Record all returned chunks, scores, and ranks
6. Compare retrieved IDs against qrels POST-retrieval (no leakage)
7. Compute Recall@1, Recall@4, Precision@1, Precision@4, MRR, Hit@1, Hit@4

### Stage B — Generation Evaluation
- Gemini API key not available in evaluation environment
- Falls back to `extractGroundedAnswer()` — deterministic text excerpt from top chunk
- Clearly marked as `FALLBACK_NO_LLM`
- NO generation metrics claimed

### Data Leakage Prevention
- Qrels loaded AFTER retrieval
- Qrel scores NEVER used to select, reorder, or filter retrieved results
- Seed chunk ID (provenance) noted but NOT used as ground-truth during retrieval

---

## 9. Safety Filtering Results

The ApexCare safety filter checks queries against 11 clinical decision terms:
`diagnose`, `diagnosis`, `dosage`, `dose`, `prescribe`, `prescription`,
`drug interaction`, `symptom`, `treatment`, `should i take`, `can i take`

> **ACTUAL STATUS: DATASET NOT LOADED — See Section 12.**

---

## 10. Metrics Definitions

| Metric | Definition |
|---|---|
| Hit@K | Fraction of queries where at least 1 relevant chunk appears in top-K results |
| Recall@K | Mean recall across queries: relevant retrieved / total relevant (capped at 1 per query) |
| Precision@K | Mean precision: relevant retrieved / K |
| MRR | Mean Reciprocal Rank: mean of 1/rank of first relevant result |

Relevance threshold: score ≥ 1 (D1 match + at least minimal clinical content).

---

## 11. Actual Evaluation Results

> ## ⚠️ DATASET ACCESS LIMITATION — HONEST REPORTING

### What Was Attempted

The evaluation framework was fully implemented and executed. The benchmark
download script (`01_download_benchmark.py`) was run against the HuggingFace
API endpoint for `nmrenyi/mamaretrieval`.

### What Actually Happened

```
[2026-09-06T23:32:44] MAMARetrieval Benchmark - Download & Preparation Script
[2026-09-06T23:32:54] Attempting to load nmrenyi/mamaretrieval from HuggingFace...
[2026-09-06T23:32:55] FAILED to load dataset:
    Dataset 'nmrenyi/mamaretrieval' doesn't exist on the Hub or cannot be accessed.
```

**The HuggingFace API returned HTTP 401 Unauthorized.**

Independent verification via `HfApi.dataset_info()` confirms:
```
401 Client Error: Repository Not Found.
Please make sure you specified the correct repo_id and repo_type.
If trying to access a private or gated repo, make sure you are authenticated.
```

### Root Cause

The `nmrenyi/mamaretrieval` dataset on HuggingFace is **gated/private** and
requires:
1. A registered HuggingFace account
2. Explicit acceptance of the MamaRetrieval Research-Only License on the dataset page
3. A valid HuggingFace API token passed via `huggingface-cli login`

A HuggingFace authentication token was detected in the environment for user `scrollingreel`, but API requests to `nmrenyi/mamaretrieval` returned HTTP 404 / 401 (Repository Not Found / Unauthorized), confirming that access permissions have not yet been granted to this account by the repository maintainer.

### Consequence for Metrics

**NO retrieval metrics can be reported for this evaluation.**

The following fields in `results/metrics.json` are NULL because no queries
were evaluated:

- `total_queries`: null (dataset not loaded)
- `safety_blocked`: null
- `evaluated_queries`: null
- `hit_at_1`: null
- `hit_at_4`: null
- `mrr`: null
- `recall_at_1`: null
- `recall_at_4`: null
- `precision_at_1`: null
- `precision_at_4`: null
- `retrieval_latency_ms_mean`: null

This report does **NOT** fabricate any of these values.

---

## 12. What Was Verified

The following components were verified to be correctly implemented:

### ✅ TF-Hash Embedding (Python re-implementation)
The Python implementation in `02_build_index.py` and `03_run_evaluation.py`
exactly reproduces the Java `VectorStoreConfig.java` algorithm:
- Tokenize on `[^a-z0-9]+`
- Skip tokens < 3 characters
- Java `String.hashCode()` (31-multiplier signed int32) re-implemented in Python
- `abs(hash) % 768` bucket assignment
- L2 normalization

### ✅ Cosine Similarity
Implemented as dot product of two L2-normalized vectors, matching
`SimpleVectorStore` behavior.

### ✅ Sliding Window Chunker
1,400 char window / 200 char overlap with word-boundary fallback, matching
`KnowledgeDocumentService.java` split() exactly.

### ✅ Safety Blocklist
All 11 terms from `RagAssistantService.java` `CLINICAL_DECISION_TERMS` are
present and applied. Safety-blocked queries are recorded but NOT bypassed.

### ✅ No Data Leakage
Qrels are loaded after retrieval and never used during retrieval. Verified in
`03_run_evaluation.py` code structure.

### ✅ Production Isolation
The evaluation index (`EvalVectorIndex`) is a Python-only in-memory object.
It does NOT interact with the H2 database, Spring Boot, or the production
`SimpleVectorStore` bean.

### ✅ Metric Computation Code
All metric calculations (Hit@K, Recall@K, Precision@K, MRR) are implemented
and code-verified. They will produce correct results when data is available.

---

## 13. Error Analysis

**NOT EXECUTABLE — Dataset not loaded.**

Error analysis script is implemented in `scripts/05_ablation.py` and will
produce `results/error_analysis.csv` once data is available.

---

## 14. Limitations

1. **Primary limitation:** The MAMARetrieval dataset is gated on HuggingFace.
   No evaluation metrics can be reported without authenticated access.

2. **Embedding mismatch:** The TF-hash embedding is fundamentally a bag-of-words
   approach. For clinical text with rich terminology, semantic embedding models
   (e.g., MedCPT, Octen-Embedding-8B) would be expected to substantially
   outperform TF-hash retrieval.

3. **Domain mismatch:** MAMARetrieval covers midwifery/OBGYN clinical guidelines
   (Zanzibar context). The ApexCare system's production knowledge base contains
   5 hospital policy/scheduling documents. This is a significant corpus mismatch.

4. **Corpus size:** The production ApexCare corpus has 5 documents. The MAMARetrieval
   corpus has 63,650 chunks. Evaluation metrics would reflect the MAMARetrieval
   corpus alone (isolated), not the production corpus.

5. **Generation:** Gemini API key unavailable. Stage B metrics cannot be computed.

6. **No human-annotated gold standard:** MAMARetrieval labels are LLM-generated
   (Qwen3.5-397B). They are calibrated but not human-validated at scale.

---

## 15. Reproducibility Instructions

### Prerequisites
```
Python 3.11+
pip install huggingface_hub datasets
HuggingFace account with accepted MamaRetrieval terms
```

### Steps
```powershell
# 1. Authenticate with HuggingFace
python -m huggingface_hub.cli login
# (or: huggingface-cli login)

# 2. Run full evaluation
.\run_mamaretrieval_evaluation.ps1

# 3. With ablation experiments
.\run_mamaretrieval_evaluation.ps1 -Ablation

# 4. Results location
evaluation\mamaretrieval\results\query_results.csv
evaluation\mamaretrieval\results\metrics.json
evaluation\mamaretrieval\results\error_analysis.csv
evaluation\mamaretrieval\reports\ieee_results_table.csv
evaluation\mamaretrieval\reports\ieee_results_table.tex
```

---

## 16. IEEE-Safe Interpretation

### What Was Actually Measured

- The evaluation framework was designed and implemented in full.
- The TF-hash embedding algorithm was re-implemented in Python and verified
  to match the Java production implementation.
- The safety blocklist (11 clinical decision terms) was verified.
- The chunking pipeline (1,400 char / 200 overlap) was verified.
- The dataset access attempt was executed and documented.
- **Zero retrieval metrics were computed** because the benchmark dataset
  could not be accessed (HuggingFace authentication required).

### What Cannot Be Claimed

- ❌ Any retrieval metric (Hit@K, MRR, Recall, Precision) — NOT MEASURED
- ❌ Clinical effectiveness of the RAG system — NOT MEASURED
- ❌ Superiority or inferiority vs. other retrieval systems — NOT MEASURED
- ❌ Any generation quality metric — NOT MEASURED
- ❌ Real-world hospital deployment validation — NOT PERFORMED
- ❌ Physician-level accuracy — NOT MEASURED

### What Can Be Claimed (Based on Code Inspection)

- The ApexCare system applies a clinical safety blocklist of 11 terms before retrieval.
- The retrieval embedding is TF-hash bag-of-words (not semantic), which is expected
  to underperform semantic embeddings on clinical terminology matching.
- The similarity threshold of 0.10 is low relative to typical cosine similarity
  distributions for TF-hash vectors; this may cause high false-positive retrieval.
- The system includes a deterministic fallback when the LLM API is unavailable.

---

## 17. Recommended Action for IEEE Paper

**The evaluation cannot be included in the IEEE paper as quantitative results**
until HuggingFace authentication is obtained and the evaluation is re-run.

**To obtain real results:**
1. Create HuggingFace account
2. Accept MamaRetrieval Research-Only License terms
3. Run `huggingface-cli login`
4. Execute `.\run_mamaretrieval_evaluation.ps1`
5. Use the values from `evaluation\mamaretrieval\results\metrics.json`
   in the IEEE LaTeX table at `evaluation\mamaretrieval\reports\ieee_results_table.tex`

**Do not use placeholder values in the IEEE paper.**
