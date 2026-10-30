# Complete Reproducible Evaluation Runner for IPHS Hospital Guidelines Benchmark

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "ApexCare RAG Evaluation: Official Indian Hospital Guidelines" -ForegroundColor Cyan
Write-Host "Corpus: IPHS 2022 Guidelines for Sub-District & District Hospitals" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = "d:\Major Project\Code\evaluation\iphs_hospital_guidelines\scripts"

Write-Host "[1/4] Preparing Corpus and Deduplicated Chunks..." -ForegroundColor Yellow
python "$baseDir\prepare_corpus.py"
if ($LASTEXITCODE -ne 0) { Write-Error "Corpus preparation failed"; exit 1 }

Write-Host "[2/4] Building Evaluation Queries and Relevance Mappings..." -ForegroundColor Yellow
python "$baseDir\build_queries_and_qrels.py"
if ($LASTEXITCODE -ne 0) { Write-Error "Query construction failed"; exit 1 }

Write-Host "[3/4] Running Quantitative Retrieval Evaluation & Ablations..." -ForegroundColor Yellow
python "$baseDir\evaluate_iphs.py"
if ($LASTEXITCODE -ne 0) { Write-Error "Evaluation execution failed"; exit 1 }

Write-Host "[4/4] Verifying Results Integrity & Calculations..." -ForegroundColor Yellow
python "$baseDir\verify_results.py"
if ($LASTEXITCODE -ne 0) { Write-Error "Verification checks failed"; exit 1 }

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "EVALUATION COMPLETED SUCCESSFULLY" -ForegroundColor Green
Write-Host "Results saved to: evaluation\iphs_hospital_guidelines\results\" -ForegroundColor Green
Write-Host "Reports saved to: evaluation\iphs_hospital_guidelines\reports\" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
