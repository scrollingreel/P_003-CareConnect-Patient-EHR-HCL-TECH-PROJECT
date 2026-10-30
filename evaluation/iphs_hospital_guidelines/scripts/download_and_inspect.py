import urllib.request, os, time
from pypdf import PdfReader

pdf_url = "https://nhsrcindia.org/sites/default/files/Volume%201_SDH-DH_0.pdf"
raw_path = r"d:\Major Project\Code\evaluation\iphs_hospital_guidelines\raw\IPHS_2022_Volume1_SDH_DH.pdf"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

print("Downloading official IPHS 2022 Volume 1 PDF...")
req = urllib.request.Request(pdf_url, headers=headers)
with urllib.request.urlopen(req, timeout=30) as resp:
    data = resp.read()
    with open(raw_path, "wb") as f:
        f.write(data)
print(f"Downloaded {len(data)} bytes -> {raw_path}")

reader = PdfReader(raw_path)
print(f"Total pages: {len(reader.pages)}")

# Extract text from first 10 pages and print summary
for i in range(min(5, len(reader.pages))):
    text = reader.pages[i].extract_text() or ""
    print(f"Page {i+1}: {len(text)} chars | Preview: {text[:100].strip()}...")
