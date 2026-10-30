#!/usr/bin/env python3
"""
Step 4 - Compute metrics and generate IEEE-ready result tables.
Run after 03_run_evaluation.py has produced results/query_results.csv and results/metrics.json
"""
import json, csv, sys
from pathlib import Path

BASE_DIR    = Path(__file__).resolve().parent.parent
RESULTS_DIR = BASE_DIR / "results"
REPORTS_DIR = BASE_DIR / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

METRICS_JSON    = RESULTS_DIR / "metrics.json"
IEEE_CSV        = REPORTS_DIR / "ieee_results_table.csv"
IEEE_TEX        = REPORTS_DIR / "ieee_results_table.tex"
ABLATION_CSV    = RESULTS_DIR / "ablation_results.csv"

def pct_str(val, decimals=2):
    if val is None: return "N/A"
    return f"{val * 100:.{decimals}f}%"

def val_str(val, decimals=4):
    if val is None: return "N/A"
    return f"{val:.{decimals}f}"

def main():
    if not METRICS_JSON.exists():
        print(f"ERROR: {METRICS_JSON} not found. Run 03_run_evaluation.py first.")
        sys.exit(1)

    with open(METRICS_JSON, encoding="utf-8") as f:
        m = json.load(f)

    # Write IEEE CSV table
    rows = [
        ["Metric", "Value"],
        ["Benchmark", m.get("benchmark", "MAMARetrieval")],
        ["Version", m.get("version", "v0.1.0")],
        ["Embedding", m.get("embedding", "TF-hash")],
        ["Embedding Dimension", m.get("embedding_dimension", 768)],
        ["Vector Store", m.get("vector_store", "SimpleVectorStore")],
        ["Similarity Function", m.get("similarity", "cosine")],
        ["Top-K", m.get("top_k", 4)],
        ["Similarity Threshold", m.get("similarity_threshold", 0.10)],
        ["", ""],
        ["Total Queries", m.get("total_queries", "N/A")],
        ["Safety Blocked", m.get("safety_blocked", "N/A")],
        ["Allowed Queries", m.get("allowed_queries", "N/A")],
        ["Retrieval Success", m.get("evaluated_queries", "N/A")],
        ["No-Context / Abstention", m.get("no_context_queries", "N/A")],
        ["Errors", m.get("errors", "N/A")],
        ["", ""],
        ["Hit@1", pct_str(m.get("hit_at_1"))],
        ["Hit@4", pct_str(m.get("hit_at_4"))],
        ["MRR", val_str(m.get("mrr"))],
        ["Recall@1", pct_str(m.get("recall_at_1"))],
        ["Recall@4", pct_str(m.get("recall_at_4"))],
        ["Precision@1", pct_str(m.get("precision_at_1"))],
        ["Precision@4", pct_str(m.get("precision_at_4"))],
        ["", ""],
        ["Mean Retrieval Latency (ms)", m.get("retrieval_latency_ms_mean", "N/A")],
        ["Median Retrieval Latency (ms)", m.get("retrieval_latency_ms_median", "N/A")],
        ["P95 Retrieval Latency (ms)", m.get("retrieval_latency_ms_p95", "N/A")],
        ["Generation Evaluated", m.get("generation_evaluated", False)],
    ]

    with open(IEEE_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerows(rows)
    print(f"IEEE CSV written: {IEEE_CSV}")

    # Write IEEE LaTeX table
    def tex_val(key, fmt="pct"):
        v = m.get(key)
        if v is None: return r"\textemdash"
        if fmt == "pct": return f"{v * 100:.2f}\\%"
        if fmt == "val": return f"{v:.4f}"
        if fmt == "int": return str(int(v))
        if fmt == "ms":  return f"{v:.1f}"
        return str(v)

    tex = r"""\begin{table}[t]
\centering
\caption{Retrieval Performance on the MAMARetrieval Benchmark (v0.1.0)}
\label{tab:mamaretrieval}
\begin{tabular}{lc}
\hline
\textbf{Metric} & \textbf{Value} \\
\hline
\multicolumn{2}{l}{\textit{Retrieval Configuration}} \\
Embedding & TF-hash 768-dim \\
Vector Store & SimpleVectorStore (cosine) \\
Top-$K$ & 4 \\
Similarity Threshold & 0.10 \\
\hline
\multicolumn{2}{l}{\textit{Query Statistics}} \\
Total Queries & """ + tex_val("total_queries", "int") + r""" \\
Safety Blocked & """ + tex_val("safety_blocked", "int") + r""" \\
Evaluated & """ + tex_val("allowed_queries", "int") + r""" \\
\hline
\multicolumn{2}{l}{\textit{Retrieval Metrics}} \\
Hit@1 & """ + tex_val("hit_at_1") + r""" \\
Hit@4 & """ + tex_val("hit_at_4") + r""" \\
MRR & """ + tex_val("mrr", "val") + r""" \\
Recall@1 & """ + tex_val("recall_at_1") + r""" \\
Recall@4 & """ + tex_val("recall_at_4") + r""" \\
Precision@1 & """ + tex_val("precision_at_1") + r""" \\
Precision@4 & """ + tex_val("precision_at_4") + r""" \\
\hline
\multicolumn{2}{l}{\textit{Latency}} \\
Mean Retrieval (ms) & """ + tex_val("retrieval_latency_ms_mean", "ms") + r""" \\
Median Retrieval (ms) & """ + tex_val("retrieval_latency_ms_median", "ms") + r""" \\
P95 Retrieval (ms) & """ + tex_val("retrieval_latency_ms_p95", "ms") + r""" \\
\hline
\multicolumn{2}{l}{\textit{Generation}} \\
Generation Evaluated & No (LLM API unavailable) \\
\hline
\end{tabular}
\begin{tablenotes}
\small
\item Retrieval uses TF-hash bag-of-words embeddings (768-dim, L2-normalized), not a semantic embedding model.
\item MAMARetrieval is an external benchmark (midwifery/OBGYN domain). License: research use only.
\item Results are for retrieval evaluation only and do not constitute clinical validation.
\end{tablenotes}
\end{table}
"""
    IEEE_TEX.write_text(tex, encoding="utf-8")
    print(f"IEEE LaTeX written: {IEEE_TEX}")

    # Summary to stdout
    print("\n=== IEEE TABLE VALUES ===")
    for row in rows:
        if row[0]:
            print(f"  {row[0]}: {row[1]}")

if __name__ == "__main__":
    main()
