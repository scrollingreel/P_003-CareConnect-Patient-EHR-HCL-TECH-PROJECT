# IEEE Conference Paper: Section IV. Results and Discussion

```latex
\section{Results and Discussion}

\subsection{Evaluation Dataset and Experimental Protocol}
To provide an empirical, reproducible evaluation of the retrieval engine on authentic healthcare guidelines without compromising production data, the system was evaluated against the \textit{Indian Public Health Standards (IPHS 2022) Guidelines for Sub-District and District Hospitals (Volume 1)} \cite{iphs2022dh}, published by the National Health Systems Resource Centre (NHSRC) under the Ministry of Health and Family Welfare (MoHFW), Government of India. This official government corpus defines operational, administrative, and clinical infrastructure standards across 242 pages, from which 221 content-dense pages were extracted and indexed into 487 deduplicated passages using a boundary-safe sliding-window chunker (1,400 characters window, 200 characters overlap).

The evaluation protocol maintained the exact production retrieval pipeline:
\begin{itemize}
    \item \textbf{Vector Representation:} 768-dimensional token-frequency hash bucketing ($\text{abs}(h) \pmod{768}$) with $L_2$ normalization ($\|v\|_2 = 1.0$).
    \item \textbf{Similarity Search:} In-memory cosine similarity via dot product.
    \item \textbf{Primary Hyperparameters:} Retrieval depth $K=4$ and similarity threshold $\tau = 0.10$.
    \item \textbf{Safety Gating:} Pre-retrieval interception matching 11 high-risk clinical terms (\textit{diagnose}, \textit{diagnosis}, \textit{dosage}, \textit{dose}, \textit{prescribe}, \textit{prescription}, \textit{drug interaction}, \textit{symptom}, \textit{treatment}, \textit{should i take}, \textit{can i take}).
\end{itemize}
A benchmark evaluation set of 60 queries was constructed, comprising 50 domain-grounded operational queries linked to verified source passages and 10 clinical decision inquiries designed to validate safety enforcement. Ground-truth relevance labels ($qrels$) were strictly isolated from retrieval operations and inspected only post-hoc during metric computation.

\subsection{Retrieval Performance Findings}
Table~\ref{tab:iphs_retrieval} presents the quantitative retrieval metrics obtained from the primary experimental run ($K=4, \tau=0.10$). Out of 60 total queries, 12 queries were intercepted by the clinical safety filter prior to vector indexing, leaving 48 valid operational queries evaluated through the vector store.

\begin{table}[t]
\centering
\caption{Retrieval Performance on Official Indian Hospital Guidelines (IPHS 2022)}
\label{tab:iphs_retrieval}
\begin{tabular}{lc}
\hline
\textbf{Evaluation Metric / Parameter} & \textbf{Value} \\
\hline
\multicolumn{2}{l}{\textit{System Architecture}} \\
Corpus & IPHS 2022 District Hospital Guidelines \\
Corpus Chunks Indexed & 487 \\
Representation & 768-dim TF-Hash ($L_2$-norm) \\
Vector Matching & In-Memory Cosine Similarity \\
Retrieval Depth ($K$) & 4 \\
Similarity Threshold ($\tau$) & 0.10 \\
\hline
\multicolumn{2}{l}{\textit{Query Distribution}} \\
Total Evaluation Queries & 60 \\
Safety-Blocked Queries & 12 (20.00\%) \\
Evaluated Operational Queries & 48 (80.00\%) \\
No-Context Queries & 0 (0.00\%) \\
Execution Errors & 0 (0.00\%) \\
\hline
\multicolumn{2}{l}{\textit{Primary Retrieval Effectiveness}} \\
Recall@1 & 10.42\% \\
Recall@4 & 27.08\% \\
Precision@1 & 10.42\% \\
Precision@4 & 8.33\% \\
Mean Reciprocal Rank (MRR) & 0.1649 \\
Hit@1 & 10.42\% \\
Hit@4 & 27.08\% \\
\hline
\multicolumn{2}{l}{\textit{Measured Retrieval Latency}} \\
Mean Latency & 65.93 ms \\
Median Latency & 66.63 ms \\
P95 Latency & 77.43 ms \\
\hline
\end{tabular}
\begin{tablenotes}
\small
\item Values represent actual executed queries and measured latencies.
\item Evaluated against official Indian Public Health Standards without data contamination.
\item Ground-truth relevance judgments were strictly isolated from retrieval operations.
\end{tablenotes}
\end{table}

The primary configuration achieved a Hit@4 of 27.08\% (Recall@4 = 27.08\%) and an MRR of 0.1649, with a mean retrieval latency of 65.93 ms (P95 = 77.43 ms). The Precision@4 of 8.33\% reflects that target queries were mapped to unique individual guideline passages, resulting in an expected maximum single-target precision ceiling of $1/4 = 25\%$.

\subsection{Ablation Study}
To evaluate parameter sensitivity, an ablation sweep was conducted across retrieval depths $K \in \{1, 2, 4, 8\}$ and similarity thresholds $\tau \in \{0.05, 0.10, 0.20\}$. As reported in Table~\ref{tab:ablation}, expanding retrieval depth from $K=1$ to $K=4$ increased the hit rate from 10.42\% to 27.08\% (+16.66\%), while MRR improved from 0.1042 to 0.1649. Further expanding to $K=8$ yielded a Hit@8 of 33.33\% and an MRR of 0.1759. Conversely, varying the similarity threshold $\tau$ between 0.05 and 0.20 produced invariant hit rates, as candidate similarities in the top retrieved set consistently exceeded 0.25 due to baseline lexical overlap.

\begin{table}[t]
\centering
\caption{Ablation Study Across Depth ($K$) and Threshold ($\tau$)}
\label{tab:ablation}
\begin{tabular}{lccccc}
\hline
\textbf{Configuration} & $K$ & $\tau$ & \textbf{Hit@1} & \textbf{Hit@$K$} & \textbf{MRR} \\
\hline
K1\_T0.05 & 1 & 0.05 & 10.42\% & 10.42\% & 0.1042 \\
K1\_T0.10 & 1 & 0.10 & 10.42\% & 10.42\% & 0.1042 \\
K1\_T0.20 & 1 & 0.20 & 10.42\% & 10.42\% & 0.1042 \\
\hline
K2\_T0.05 & 2 & 0.05 & 10.42\% & 14.58\% & 0.1250 \\
K2\_T0.10 & 2 & 0.10 & 10.42\% & 14.58\% & 0.1250 \\
K2\_T0.20 & 2 & 0.20 & 10.42\% & 14.58\% & 0.1250 \\
\hline
\textbf{K4\_T0.10 (Primary)} & \textbf{4} & \textbf{0.10} & \textbf{10.42\%} & \textbf{27.08\%} & \textbf{0.1649} \\
K4\_T0.05 & 4 & 0.05 & 10.42\% & 27.08\% & 0.1649 \\
K4\_T0.20 & 4 & 0.20 & 10.42\% & 27.08\% & 0.1649 \\
\hline
K8\_T0.05 & 8 & 0.05 & 10.42\% & 33.33\% & 0.1759 \\
K8\_T0.10 & 8 & 0.10 & 10.42\% & 33.33\% & 0.1759 \\
K8\_T0.20 & 8 & 0.20 & 10.42\% & 33.33\% & 0.1759 \\
\hline
\end{tabular}
\end{table}

\subsection{Safety Interception and Abstention Behavior}
The pre-retrieval safety gating mechanism demonstrated complete policy enforcement:
\begin{enumerate}
    \item \textbf{Clinical Decision Interception:} All 10 synthetic queries probing diagnostic or pharmacological advice were successfully intercepted prior to vector embedding, returning structured refusals.
    \item \textbf{Incidental Clinical Keywords:} Two operational queries incorporating clinical terms (e.g., questions addressing emergency resuscitation protocols) triggered the safety filter, demonstrating strict non-bypass behavior without exception.
    \item \textbf{Abstention Rate:} 0\% of valid queries suffered complete abstention ($\tau < 0.10$), indicating adequate lexical coverage across the 487-passage corpus.
\end{enumerate}

\subsection{Error Analysis}
Inspection of the 35 queries where the ground-truth target passage was not captured within the top-4 candidate set revealed a dominant error pattern: \textit{lexical competition from high-frequency administrative unigrams}. In a 768-bucket token-frequency hash scheme, pervasive institutional terms (such as \textit{hospital}, \textit{district}, \textit{guidelines}, \textit{services}, and \textit{infrastructure}) distribute substantial vector mass across hundreds of unrelated passages. When user queries include broad operational phrasing alongside specific inquiry terms, general administrative sections frequently outscore the narrow procedural section, displacing the ground-truth passage from top-$K$.

\subsection{Discussion and Architecture Analysis}
These experimental findings highlight key trade-offs in lightweight, on-device healthcare RAG architectures:
\begin{itemize}
    \item \textbf{Operational Independence vs. Semantic Matching:} The 768-dimensional TF-hash model requires zero external neural model checkpoints, zero GPU acceleration, and operates with sub-70ms search latency. However, its purely lexical bag-of-words nature imposes a clear retrieval ceiling (27.08\% Hit@4 on specialized guideline texts) compared to dense neural bi-encoders that encode semantic relationships.
    \item \textbf{Grounded Generation Safeguard:} While Stage B LLM generation remains gated behind API credentials, the architecture enforces deterministic text excerpting from top-ranked passages when cloud generation is offline, preventing ungrounded hallucinations.
    \item \textbf{Scope and Regulatory Context:} The evaluated prototype is designed strictly as an administrative and hospital operational navigation assistant. It does not possess medical certification, does not perform clinical diagnosis, and must not be utilized as an autonomous clinical decision support system.
\end{itemize}
```
