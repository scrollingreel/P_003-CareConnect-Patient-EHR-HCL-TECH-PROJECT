import json, re

with open(r"d:\Major Project\Code\evaluation\iphs_hospital_guidelines\corpus\chunks.jsonl", encoding="utf-8") as f:
    chunks = [json.loads(line) for line in f]

# We will select 50 diverse chunks across the corpus
# Topics:
# 1. Hospital administration and population norms
# 2. Infrastructure & National Building Code
# 3. Out Patient Department (OPD) planning
# 4. Inpatient Department (IPD) & Bed distribution
# 5. Intensive Care Unit (ICU) & HDU standards
# 6. Operation Theatre (OT) requirements
# 7. Dietary & Kitchen services
# 8. Sanitation, Hygiene & Infection Control
# 9. Biomedical Waste (BMW) colour coding
# 10. Blood bank & Blood storage units (BSU)
# 11. Laboratory & Diagnostic test services
# 12. Human resources & Specialist workload
# 13. Emergency & Triage services
# 14. Dialysis & Nephrology services
# 15. Citizens Charter & Patient rights

print("Selecting chunks for query generation...")
