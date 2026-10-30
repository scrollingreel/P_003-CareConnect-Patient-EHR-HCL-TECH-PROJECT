import urllib.request
urls = {
    "IPHS_2022_Volume1_SDH_DH": "https://nhsrcindia.org/sites/default/files/Volume%201_SDH-DH_0.pdf",
    "IPHS_Guidelines_HDU_ICU": "https://nhsrcindia.org/sites/default/files/Guidelines-on-HDU_ICU.pdf",
    "IPHS_Guidelines_OT": "https://nhsrcindia.org/sites/default/files/Guidelines-on-OT.pdf",
    "IPHS_Emergency_Services_DH": "https://nhsrcindia.org/sites/default/files/OT_emergency%20services%20at%20DH_inside_dt%2003%20march%202023_revised.pdf",
    "IPHS_CSSD_Laundry": "https://nhsrcindia.org/sites/default/files/Guidelines-on-CSSD-and-Mechanised-Laundry.pdf"
}
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
for name, url in urls.items():
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=12) as resp:
            print(f"{name}: status {resp.status}, size: {resp.headers.get('Content-Length')} bytes")
    except Exception as e:
        print(f"{name}: Error {e}")
