#!/usr/bin/env pwsh
<#
.SYNOPSIS
    MAMARetrieval Benchmark Evaluation — Reproducible End-to-End Runner

.DESCRIPTION
    Runs the complete MAMARetrieval evaluation pipeline:
    Step 1: Download/verify benchmark data
    Step 2: Build isolated evaluation index
    Step 3: Run retrieval evaluation (Stage A) + record generation fallback (Stage B)
    Step 4: Generate IEEE-ready result tables
    Step 5: (Optional) Run ablation experiments

.PARAMETER Ablation
    If specified, also runs the ablation experiment (Step 5).

.EXAMPLE
    ./run_mamaretrieval_evaluation.ps1
    ./run_mamaretrieval_evaluation.ps1 -Ablation

.NOTES
    Requires: Python 3.11+, pip install huggingface_hub datasets
    The MAMARetrieval dataset requires HuggingFace authentication.
    See evaluation/mamaretrieval/README.md for setup instructions.
    
    This script does NOT modify the hospital production knowledge base.
#>

param(
    [switch]$Ablation
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$EvalDir = Join-Path $ScriptDir "evaluation\mamaretrieval"
$ScriptsDir = Join-Path $EvalDir "scripts"
$ResultsDir = Join-Path $EvalDir "results"
$ReportsDir = Join-Path $EvalDir "reports"

function Log { param($msg) Write-Host "[$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')] $msg" -ForegroundColor Cyan }
function Err { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }
function Ok  { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }

Log "============================================================"
Log "MAMARetrieval Benchmark Evaluation — ApexCare Hospital RAG"
Log "============================================================"
Log ""
Log "Configuration:"
Log "  Embedding: TF-hash 768-dim L2-normalized"
Log "  Vector Store: SimpleVectorStore (cosine)"
Log "  Top-K: 4"
Log "  Similarity Threshold: 0.10"
Log "  Production knowledge base: NOT MODIFIED"
Log ""

# Check Python
try {
    $pyver = python --version 2>&1
    Ok "Python found: $pyver"
} catch {
    Err "Python not found. Install Python 3.11+"
    exit 1
}

# Check datasets library
try {
    python -c "import datasets; import huggingface_hub" 2>&1 | Out-Null
    Ok "huggingface_hub and datasets libraries available"
} catch {
    Log "Installing required libraries..."
    pip install huggingface_hub datasets
}

# Step 1: Download benchmark
Log ""
Log "STEP 1: Download/Verify MAMARetrieval Benchmark"
Log "------------------------------------------------"
python "$ScriptsDir\01_download_benchmark.py"
if ($LASTEXITCODE -ne 0) {
    Err "Step 1 failed: Dataset could not be downloaded."
    Err "The MAMARetrieval dataset requires HuggingFace authentication."
    Err "Please:"
    Err "  1. Create an account at https://huggingface.co"
    Err "  2. Accept terms at https://huggingface.co/datasets/nmrenyi/mamaretrieval"
    Err "  3. Run: huggingface-cli login"
    Err "  4. Retry: .\run_mamaretrieval_evaluation.ps1"
    exit 1
}
Ok "Step 1 complete"

# Step 2: Build index
Log ""
Log "STEP 2: Build Isolated Evaluation Index"
Log "---------------------------------------"
python "$ScriptsDir\02_build_index.py"
if ($LASTEXITCODE -ne 0) { Err "Step 2 failed"; exit 1 }
Ok "Step 2 complete"

# Step 3: Run evaluation
Log ""
Log "STEP 3: Run Retrieval Evaluation (Stage A + B)"
Log "-----------------------------------------------"
python "$ScriptsDir\03_run_evaluation.py"
if ($LASTEXITCODE -ne 0) { Err "Step 3 failed"; exit 1 }
Ok "Step 3 complete"

# Step 4: Generate IEEE tables
Log ""
Log "STEP 4: Generate IEEE Result Tables"
Log "------------------------------------"
python "$ScriptsDir\04_generate_tables.py"
if ($LASTEXITCODE -ne 0) { Err "Step 4 failed"; exit 1 }
Ok "Step 4 complete"

# Step 5: Ablation (optional)
if ($Ablation) {
    Log ""
    Log "STEP 5: Ablation Experiments (Optional)"
    Log "----------------------------------------"
    python "$ScriptsDir\05_ablation.py"
    if ($LASTEXITCODE -ne 0) { Err "Step 5 failed"; exit 1 }
    Ok "Step 5 complete"
}

Log ""
Log "============================================================"
Log "EVALUATION COMPLETE"
Log "============================================================"
Log ""
Log "Output files:"
Log "  Results:          $ResultsDir\query_results.csv"
Log "  Metrics:          $ResultsDir\metrics.json"
Log "  Error Analysis:   $ResultsDir\error_analysis.csv"
Log "  IEEE CSV:         $ReportsDir\ieee_results_table.csv"
Log "  IEEE LaTeX:       $ReportsDir\ieee_results_table.tex"
if ($Ablation) {
    Log "  Ablation:         $ResultsDir\ablation_results.csv"
}
Log ""
Log "For the full evaluation report, see:"
Log "  $ReportsDir\evaluation_report.md"
