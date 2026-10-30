import json, re

with open(r"d:\Major Project\Code\evaluation\iphs_hospital_guidelines\corpus\chunks.jsonl", encoding="utf-8") as f:
    chunks = [json.loads(line) for line in f]

def find_chunk(predicate):
    for c in chunks:
        if predicate(c):
            return c
    return None

def find_chunks_containing(*keywords):
    matches = []
    for c in chunks:
        t = c["text"].lower()
        if all(k.lower() in t for k in keywords):
            matches.append(c)
    return matches

print("Finding target chunks for queries...")
sample1 = find_chunks_containing("national building code", "infrastructure")
print("National Building Code chunks:", len(sample1))
sample2 = find_chunks_containing("out patient services", "peak hour")
print("OPD peak hour chunks:", len(sample2))
sample3 = find_chunks_containing("dietary", "meal")
print("Dietary chunks:", len(sample3))
sample4 = find_chunks_containing("high touch surfaces", "sanitised")
print("Sanitation chunks:", len(sample4))
sample5 = find_chunks_containing("surgical specialist", "opd days")
print("Surgical specialist chunks:", len(sample5))
sample6 = find_chunks_containing("pfms", "disbursement")
print("PFMS chunks:", len(sample6))
sample7 = find_chunks_containing("diagnostic test", "hemoglobin")
print("Diagnostic tests chunks:", len(sample7))
sample8 = find_chunks_containing("colour coded", "bmw")
print("BMW colour coded chunks:", len(sample8))
