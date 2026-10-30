import json
with open(r"d:\Major Project\Code\evaluation\iphs_hospital_guidelines\corpus\chunks.jsonl", encoding="utf-8") as f:
    chunks = [json.loads(line) for line in f]
print(f"Total chunks: {len(chunks)}")
indices = [5, 15, 30, 50, 75, 100, 130, 160, 200, 240, 280, 320, 360, 400, 450]
for idx in indices:
    if idx < len(chunks):
        c = chunks[idx]
        print(f"--- Chunk index {idx} | Page {c['page']} | Doc: {c['doc_id']} | Chunk ID: {c['chunk_id']} ---")
        print(c['text'][:250].strip() + "...\n")
