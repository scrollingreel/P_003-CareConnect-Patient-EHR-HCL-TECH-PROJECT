import json, csv
from pathlib import Path

BASE_DIR = Path(r"d:\Major Project\Code\evaluation\iphs_hospital_guidelines")
Q_CSV = BASE_DIR / "results" / "query_results.csv"
METRICS_JSON = BASE_DIR / "results" / "metrics.json"

with open(METRICS_JSON, encoding="utf-8") as f:
    m = json.load(f)

with open(Q_CSV, encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

print(f"1. Total rows in query_results.csv: {len(rows)} (Expected 60)")
assert len(rows) == 60, "Check 1 failed"

qids = [r["query_id"] for r in rows]
print(f"2. Unique query IDs: {len(set(qids))} (Expected 60)")
assert len(set(qids)) == 60, "Check 2 failed: duplicate query IDs"

safety_rows = [r for r in rows if r["safety_status"] == "SAFETY_BLOCKED"]
eval_rows = [r for r in rows if r["safety_status"] == "ALLOWED"]
print(f"3. Safety rows: {len(safety_rows)}, Evaluated rows: {len(eval_rows)}")
assert len(safety_rows) == 12 and len(eval_rows) == 48, "Check 3 failed"

hits_1 = sum(int(r["hit_at_1"]) for r in eval_rows)
hits_4 = sum(int(r["hit_at_4"]) for r in eval_rows)
mrrs = sum(float(r["mrr"]) for r in eval_rows)

print(f"4. Hits@1: {hits_1} ({hits_1/48:.4f}), Matches metrics.json: {abs(hits_1/48 - m['hit_at_1']) < 1e-4}")
print(f"5. Hits@4: {hits_4} ({hits_4/48:.4f}), Matches metrics.json: {abs(hits_4/48 - m['hit_at_4']) < 1e-4}")
print(f"6. MRR sum: {mrrs:.4f}, Mean MRR: {mrrs/48:.4f}, Matches metrics.json: {abs(mrrs/48 - m['mrr']) < 1e-4}")

assert abs(hits_1/48 - m['hit_at_1']) < 1e-4, "Check 4 failed"
assert abs(hits_4/48 - m['hit_at_4']) < 1e-4, "Check 5 failed"
assert abs(mrrs/48 - m['mrr']) < 1e-4, "Check 6 failed"

print("All verification checks PASSED!")
