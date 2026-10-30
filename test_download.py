import urllib.request
urls = [
    "https://nhsrcindia.org/sites/default/files/2021-06/Operational%20and%20Technical%20Guidelines%20for%20Emergency%20Care%20Services%20in%20District%20Hospitals.pdf",
    "https://nhsrcindia.org/sites/default/files/2022-07/IPHS%202022%20Guidelines%20for%20District%20Hospitals.pdf",
    "https://nhsrcindia.org/sites/default/files/2021-05/Guidelines%20for%20Emergency%20Care%20Services%20in%20District%20Hospitals.pdf",
    "https://main.mohfw.gov.in/sites/default/files/National%20Quality%20Assurance%20Standards.pdf"
]
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
for u in urls:
    try:
        req = urllib.request.Request(u, headers=headers)
        with urllib.request.urlopen(req, timeout=8) as resp:
            print(f"SUCCESS: {u[:60]} -> {resp.status}, length: {resp.headers.get('Content-Length')}")
    except Exception as e:
        print(f"Failed: {u[:60]} -> {e}")
