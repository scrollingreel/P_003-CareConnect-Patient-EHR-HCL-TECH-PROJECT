import json, re, hashlib, math
from pathlib import Path
from pypdf import PdfReader

BASE_DIR = Path(r"d:\Major Project\Code\evaluation\iphs_hospital_guidelines")
RAW_PDF = BASE_DIR / "raw" / "IPHS_2022_Volume1_SDH_DH.pdf"
CORPUS_DIR = BASE_DIR / "corpus"
CORPUS_FILE = CORPUS_DIR / "corpus.jsonl"
CHUNKS_FILE = CORPUS_DIR / "chunks.jsonl"

CHUNK_SIZE = 1400
OVERLAP = 200

def sliding_chunk(text, size=CHUNK_SIZE, overlap=OVERLAP):
    chunks, start = [], 0
    length = len(text)
    while start < length:
        end = min(length, start + size)
        if end < length:
            last_nl = text.rfind('\n', start, end)
            last_sp = text.rfind(' ', start, end)
            boundary = max(last_nl, last_sp)
            if boundary > start + size // 2:
                end = boundary
        c = text[start:end].strip()
        if c:
            chunks.append(c)
        if end >= length:
            break
        start = max(end - overlap, start + 1)
    return chunks

reader = PdfReader(str(RAW_PDF))
print(f"Total pages: {len(reader.pages)}")

# Extract text per page
pages_data = []
for p_num in range(len(reader.pages)):
    txt = reader.pages[p_num].extract_text() or ""
    txt_clean = re.sub(r'\s+', ' ', txt).strip()
    if len(txt_clean) > 80:  # meaningful text
        pages_data.append({
            "page": p_num + 1,
            "text": txt_clean
        })

print(f"Extracted {len(pages_data)} meaningful pages.")

# Save corpus documents (one per page or grouped by section)
with open(CORPUS_FILE, "w", encoding="utf-8") as f:
    for p in pages_data:
        doc_id = f"iphs_dh_p{p['page']}"
        rec = {
            "doc_id": doc_id,
            "title": f"IPHS 2022 Sub-District & District Hospital Guidelines (Page {p['page']})",
            "page": p["page"],
            "source": "NHSRC/MoHFW Government of India - IPHS 2022 Volume 1",
            "text": p["text"]
        }
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")

print(f"Wrote {len(pages_data)} documents to {CORPUS_FILE}")

# Chunk documents using production sliding window
all_chunks = []
seen_chunk_hashes = set()

for p in pages_data:
    doc_id = f"iphs_dh_p{p['page']}"
    sub_chunks = sliding_chunk(p["text"])
    for i, c_text in enumerate(sub_chunks):
        c_hash = hashlib.sha256(c_text.encode("utf-8")).hexdigest()[:16]
        if c_hash in seen_chunk_hashes:
            continue
        seen_chunk_hashes.add(c_hash)
        all_chunks.append({
            "chunk_id": c_hash,
            "doc_id": doc_id,
            "sub_chunk_index": i,
            "page": p["page"],
            "source": "IPHS 2022 Volume 1",
            "text": c_text
        })

with open(CHUNKS_FILE, "w", encoding="utf-8") as f:
    for c in all_chunks:
        f.write(json.dumps(c, ensure_ascii=False) + "\n")

print(f"Produced {len(all_chunks)} deduplicated chunks -> {CHUNKS_FILE}")
