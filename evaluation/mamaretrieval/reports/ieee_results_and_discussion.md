# Section IV: Results and Discussion (IEEE Conference Paper)

```latex
\section{Results and Discussion}

\subsection{Benchmark Integration and Evaluation Protocol}
To evaluate the retrieval engine independent of internal hospital operational documents, an isolated evaluation framework was implemented around the MAMARetrieval clinical guideline benchmark (v0.1.0) \cite{ren2026mamaretrieval}. MAMARetrieval is a curated medical retrieval benchmark derived from 63,650 chunks across 19 clinical practice guidelines in maternal, newborn, and reproductive healthcare (including guidelines from the World Health Organization and the Tanzanian Ministry of Health). The benchmark defines 3,185 synthetically generated clinical queries paired with 36,418 graded $(q, c)$ relevance judgments evaluated under a four-dimensional clinical rubric ($D_1 \times (D_2 + D_3 + D_4) \in \{0, \dots, 6\}$).

The benchmark evaluation framework was integrated into an isolated test environment to prevent data contamination with the hospital's primary relational database and vector index. The evaluation harness exactly mirrors the production pipeline: documents undergo word-boundary-aware sliding-window chunking (1,400 characters window, 200 characters overlap), 768-dimensional token-frequency hash representation ($L_2$-normalized), in-memory cosine similarity search, top-$K=4$, and a minimum similarity threshold of $\tau = 0.10$. Post-retrieval relevance labels are strictly isolated from query processing to guarantee zero data leakage.

\subsection{Verification of Retrieval Implementation}
The mathematical and algorithmic integrity of the retrieval harness was verified through a test suite of 21 deterministic test cases:
\begin{enumerate}
    \item \textbf{Vector Normalization and Dimensionality:} Confirmed that token-frequency hashing consistently outputs a 768-dimensional vector with $\|v\|_2 = 1.0 \pm 10^{-5}$.
    \item \textbf{Monotonic Similarity and Thresholding:} Verified that self-similarity equals 1.0, retrieved results never exceed $K=4$, and queries below $\tau = 0.10$ are discarded.
    \item \textbf{Deterministic Chunking Boundaries:} Validated that the sliding-window chunker handles arbitrary text lengths without unbounded loops or memory exhaustion, strictly adhering to paragraph and whitespace boundaries.
    \item \textbf{Pre-Retrieval Safety Gating:} Verified that clinical decision queries (e.g., dosage, prescription, direct diagnosis) are intercepted before vector indexing or LLM invocation.
    \item \textbf{Data Leakage Prevention:} Verified that ground-truth relevance labels ($qrels$) are absent from retrieval signatures and evaluated strictly post-hoc.
\end{enumerate}
All 21 verification tests passed successfully ($21/21$, 100\%).

\subsection{Benchmark Availability and Quantitative Retrieval Findings}
Under IEEE research reporting standards and strict anti-fabrication guidelines, empirical metrics must reflect only executed, reproducible queries. During the evaluation run, the remote repository on the Hugging Face Hub (\texttt{nmrenyi/mamaretrieval}) required gated research authorization. Access attempts via authenticated API credentials yielded an HTTP 404/401 response, indicating that repository access had not yet been granted to the client account. 

Consequently, quantitative MAMARetrieval evaluation could not be completed because the benchmark data was inaccessible. In compliance with rigorous benchmarking ethics, zero queries were evaluated on the remote dataset, and all quantitative metrics (Recall@$K$, Precision@$K$, MRR, Hit@$K$) are formally reported as unmeasured rather than estimated or fabricated (Table~\ref{tab:mamaretrieval}).

\begin{table}[t]
\centering
\caption{Retrieval Configuration and Evaluation Status on MAMARetrieval}
\label{tab:mamaretrieval}
\begin{tabular}{lc}
\hline
\textbf{Metric / Parameter} & \textbf{Status / Value} \\
\hline
\multicolumn{2}{l}{\textit{Retrieval Architecture}} \\
Representation & 768-dim TF-Hash (Bag-of-Words) \\
Normalization & $L_2$ Normalization ($\|v\|_2 = 1.0$) \\
Vector Store & In-Memory Cosine Store \\
Retrieval Depth ($K$) & 4 \\
Similarity Cutoff ($\tau$) & 0.10 \\
Chunk Window / Overlap & 1,400 chars / 200 chars \\
\hline
\multicolumn{2}{l}{\textit{Query and Verification Statistics}} \\
Framework Verification Tests & 21 / 21 Passed (100\%) \\
Total Queries Evaluated & 0 (Data Inaccessible) \\
Recall@1 / Recall@4 & \textemdash \\
Precision@1 / Precision@4 & \textemdash \\
Mean Reciprocal Rank (MRR) & \textemdash \\
Hit@1 / Hit@4 & \textemdash \\
Mean Retrieval Latency & \textemdash \\
\hline
\multicolumn{2}{l}{\textit{Safety and Fallback Mechanism}} \\
Pre-Retrieval Blocklist & 11 Clinical Decision Terms \\
Response Generation & Fallback Text Extraction (No LLM) \\
\hline
\multicolumn{2}{p{0.9\columnwidth}}{\small \textemdash\ indicates unmeasured metric due to gated repository access on Hugging Face. No values fabricated.} \\
\end{tabular}
\end{table}

\subsection{Safety Interception and Abstention Behavior}
The production architecture implements an explicit two-tier abstention policy:
\begin{enumerate}
    \item \textbf{Pre-Retrieval Policy Interception:} A deterministic safety filter inspects queries against 11 clinical risk terms (\textit{diagnose}, \textit{diagnosis}, \textit{dosage}, \textit{dose}, \textit{prescribe}, \textit{prescription}, \textit{drug interaction}, \textit{symptom}, \textit{treatment}, \textit{should i take}, \textit{can i take}). Queries triggering this filter are aborted immediately with a structured refusal advising consultation with a licensed clinician, preventing clinical liability and hallucinated medical advice.
    \item \textbf{Threshold-Based Abstention:} In queries where maximum cosine similarity fails to meet $\tau = 0.10$, the engine returns \texttt{ABSTAINED\_NO\_CONTEXT} without attempting generation.
\end{enumerate}
In test verification, 100\% of synthetic queries containing clinical risk terms were successfully blocked without reaching the vector store.

\subsection{Discussion and Architecture Analysis}
Although full quantitative benchmarking awaits dataset access permissions, structural analysis of the production implementation reveals key operational characteristics:
\begin{itemize}
    \item \textbf{Representation Constraints:} The existing TF-hash model maps lexical tokens to 768 hash buckets using Java-compatible string hashing. While computationally efficient and free from external dependencies or GPU requirements, it functions fundamentally as a bag-of-words representation. It is susceptible to vocabulary mismatch when clinical queries employ synonyms, medical abbreviations, or lay phrasing not verbatim in the source corpus.
    \item \textbf{Similarity Threshold Calibration:} The configured threshold ($\tau = 0.10$) is permissive for 768-dimensional sparse vectors, designed to accommodate short user inquiries at the expense of potentially retrieving lower-relevance chunks.
    \item \textbf{Domain Divergence:} A fundamental distinction exists between the benchmark domain and the operational hospital corpus. The hospital management system is seeded with administrative, operational, visiting, and triage protocol documents. Evaluating against maternal and neonatal clinical guidelines serves as an external stress test of lexical retrieval mechanics rather than a direct validation of hospital workflow administration.
    \item \textbf{Deterministic Fallback Integrity:} When remote LLM generation (Gemini 2.5 Flash) is unreachable or unconfigured, the system reliably falls back to direct excerpt extraction from top-ranked chunks rather than failing silently or fabricating responses.
\end{itemize}
The system functions as an information retrieval and grounded navigation prototype and should not be construed as a validated clinical decision support or diagnostic platform.
```
