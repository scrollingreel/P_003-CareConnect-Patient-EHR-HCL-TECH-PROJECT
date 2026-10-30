# ApexCare Hospital Management System — Knowledge Base Documents
### Complete inventory of all policy, protocol, and guidance documents indexed in the RAG store

---

## 1. Overview of the Knowledge Base Corpus

The RAG Assistant relies on an approved corporate hospital corpus containing **5 core clinical, operational, and administrative SOPs**. These are seeded directly by `DataSeeder.java` into the `hospital_documents` table and loaded into the vector store upon system startup.

```
Document 1: Cardiology Visiting Policy & Department SOP
Document 2: MRI & Contrast Studies Preparation Protocol
Document 3: Dr. Rajesh Verma OPD Consulting Schedule & Location
Document 4: Emergency Triage & Admission Protocol
Document 5: Medication Safety Advisory: NSAIDs and ACE-Inhibitors
```

---

## 2. Complete Content of Indexed Documents

### Document 1: Cardiology Inpatient Visiting Hours and Department SOP
- **Title:** `Cardiology Inpatient Visiting Hours and Department SOP`
- **Document Type / Category:** `Hospital Visiting Policy`
- **Section Label:** `Section 2.1 — Cardiology Inpatient Wards`
- **File Reference:** `ApexCare_Cardiology_Visiting_Policy_2026.pdf`
- **Document Version:** `v2.4`
- **Seeded Author:** `Amanda Ross (Admin)`
- **Indexing Status:** `INDEXED`

```text
ApexCare Hospital — Department of Cardiology Visiting Policy (Approved SOP v2.4):

1. General Inpatient Visiting Hours:
   General wards in the Cardiology Department (West Wing, 3rd Floor) are open to visitors
   daily from 11:00 AM to 01:00 PM and from 04:30 PM to 07:30 PM.

2. Coronary Care Unit (CCU) and Intensive Cardiac Care (ICCU):
   Visiting hours are strictly restricted to immediate family members from 11:30 AM to 12:00 PM
   and 05:00 PM to 05:30 PM (maximum 1 visitor per patient at a time).

3. Attending Physician Rounds:
   Visitors must vacate patient rooms during morning clinical rounds (09:00 AM to 10:30 AM).

4. Hygiene and Infection Control:
   All visitors must sanitize hands at the nurse reception station prior to entry.
   Masking is mandatory in all cardiac step-down suites.
```

---

### Document 2: Patient Diagnostic Imaging Preparation Protocol — MRI and Contrast Studies
- **Title:** `Patient Diagnostic Imaging Preparation Protocol — MRI and Contrast Studies`
- **Document Type / Category:** `Diagnostic Imaging SOP`
- **Section Label:** `Section 4.3 — Contrast Administration & MRI Clearance`
- **File Reference:** `MRI_Contrast_Prep_Guidelines_v3.pdf`
- **Document Version:** `v3.1`
- **Seeded Author:** `Amanda Ross (Admin)`
- **Indexing Status:** `INDEXED`

```text
ApexCare Diagnostic Radiology — Patient Preparation Protocol for Magnetic Resonance Imaging (MRI) with Contrast:

1. Fasting Requirement:
   Patients undergoing contrast-enhanced MRI must fast (no solid food) for at least 4 hours
   prior to scan appointment time. Clear water may be consumed up to 2 hours before the examination.

2. Renal Function Clearance:
   A serum creatinine and estimated GFR (eGFR) test performed within the preceding 30 days is mandatory
   for all patients aged 60+, diabetics, or those with known kidney disease. eGFR must exceed 30 mL/min/1.73m²
   for standard gadolinium contrast administration.

3. Metal and Implant Screening:
   Patients must remove all removable metallic accessories, piercings, dentures, and hearing aids.
   Patients with cardiac pacemakers, cochlear implants, or cerebral aneurysm clips require prior
   written radiologist clearance.

4. Post-Scan Hydration:
   Drink 1.5 to 2 liters of water over the 24 hours following contrast injection to facilitate renal clearance.
```

---

### Document 3: Dr. Rajesh Verma OPD Consulting Schedule and Clinic Location
- **Title:** `Dr. Rajesh Verma OPD Consulting Schedule and Clinic Location`
- **Document Type / Category:** `Clinician Timings & OPD Schedule`
- **Section Label:** `Section 1.1 — Cardiology Senior Consultant OPD`
- **File Reference:** `Dr_Rajesh_Verma_OPD_Schedule_2026.pdf`
- **Document Version:** `v1.8`
- **Seeded Author:** `Amanda Ross (Admin)`
- **Indexing Status:** `INDEXED`

```text
ApexCare Outpatient Specialty Clinic — Clinician Directory & Timings:

Dr. Rajesh Verma, MD, FACC (Senior Consultant, Interventional Cardiology & Cardiac Electrophysiology):

- Consulting Location: Room 304, West Wing, 3rd Floor (Cardiology Outpatient Clinic).
- Consulting Days: Monday through Friday.
- Consulting Hours: 09:00 AM to 04:30 PM.
- Emergency and Interventional Catheterization: On-call Tuesdays and Thursdays after 05:00 PM in Cath Lab Suite 2.
- Appointment Booking: Consultations require prior booking through the patient portal, desk reception (ext 3041),
  or referral triage. Walk-in slots are subject to triage priority.
```

---

### Document 4: Emergency Department Triage and Inpatient Admission Protocol
- **Title:** `Emergency Department Triage and Inpatient Admission Protocol`
- **Document Type / Category:** `Hospital Administrative Policy`
- **Section Label:** `Section 3.2 — Emergency Admission & Insurance Pre-Authorization`
- **File Reference:** `Emergency_Admission_Policy_v4.pdf`
- **Document Version:** `v4.0`
- **Seeded Author:** `Amanda Ross (Admin)`
- **Indexing Status:** `INDEXED`

```text
ApexCare Hospital Emergency Services & Admission Governance:

1. Emergency Admission Guarantee:
   Under the ApexCare Emergency Care Charter and Emergency Medical Treatment Mandate, emergency medical
   stabilization and critical care admission are never delayed or withheld due to financial or
   insurance pre-authorization status.

2. Triage Classification:
   Incoming emergency patients are triaged within 5 minutes under the Manchester Triage System
   (Priority 1: Immediate Resuscitation, Priority 2: Very Urgent within 15 mins).

3. Insurance Notification & Pre-Authorization:
   The hospital inpatient financial liaison desk contacts the patient's insurance provider within 24 hours
   of emergency admission. The patient or family must furnish insurance details within 48 hours.

4. Emergency Bed Placement:
   Patients requiring inpatient monitoring are placed in the Emergency Observation Ward before
   transfer to specialized department beds.
```

---

### Document 5: Clinical Medication Safety Advisory: NSAIDs and ACE-Inhibitors / ARBs
- **Title:** `Clinical Medication Safety Advisory: NSAIDs and ACE-Inhibitors / ARBs`
- **Document Type / Category:** `Clinical Pharmacovigilance Advisory`
- **Section Label:** `Section 5.4 — Drug-Drug Interactions in Renal and Hypertensive Patients`
- **File Reference:** `Medication_Safety_NSAIDs_ACEI_Advisory.pdf`
- **Document Version:** `v2.1`
- **Seeded Author:** `Amanda Ross (Admin)`
- **Indexing Status:** `INDEXED`

```text
ApexCare Clinical Pharmacy & Medication Safety Committee Advisory:

Subject: Co-administration of Non-Steroidal Anti-Inflammatory Drugs (NSAIDs) with Angiotensin-Converting
Enzyme (ACE) Inhibitors (e.g., Lisinopril, Enalapril).

1. Clinical Interaction Mechanism:
   Concomitant administration of NSAIDs (including Ibuprofen, Naproxen, and high-dose Aspirin) with ACE
   inhibitors such as Lisinopril significantly attenuates the antihypertensive efficacy of Lisinopril due
   to inhibition of renal prostaglandin synthesis.

2. Acute Kidney Injury (AKI) Risk:
   Concurrent use blunts renal autoregulation, markedly increasing the incidence of acute renal impairment
   and hyperkalemia, especially in volume-depleted or elderly patients.

3. Recommendation:
   Avoid chronic or high-dose NSAID therapy in patients taking Lisinopril. When mild analgesia is indicated,
   Acetaminophen (Paracetamol) is the preferred first-line alternative. If short-term NSAID therapy cannot
   be avoided, monitor blood pressure and renal function (eGFR, serum potassium).
```

---

## 3. Summary & Comparison Table

| ID | Title | Domain / Category | Key Terms / Scope | Target Department |
|---|---|---|---|---|
| **DOC-01** | Cardiology Inpatient Visiting Policy | Operations / Visiting SOP | 11 AM - 1 PM, 4:30 - 7:30 PM, CCU rounds | Cardiology (3rd Floor) |
| **DOC-02** | MRI with Contrast Prep Protocol | Clinical / Diagnostic Prep | 4h fasting, eGFR > 30, metal screening | Radiology (Central) |
| **DOC-03** | Dr. Rajesh Verma OPD Schedule | Clinical Schedule & Timings | Mon-Fri 9:00-16:30, Room 304 | Outpatient Cardiology |
| **DOC-04** | Emergency Triage & Insurance Policy | Administration / Insurance | Manchester Triage, 24h insurer notice | Emergency & Billing |
| **DOC-05** | NSAID & Lisinopril Drug Interaction | Pharmacovigilance Advisory | Lisinopril + Ibuprofen, AKI risk, Paracetamol | Clinical Pharmacy |

---

## 4. Key Considerations for Research Paper

1. **Document Uniformity:** All documents are synthetically curated to represent realistic healthcare protocols without containing Protected Health Information (PHI).
2. **Chunking Characteristics:** In the default seeder (`DataSeeder.java`), each document contains fewer than 1,400 characters and is indexed as an atomic chunk with corresponding metadata attached.
3. **Citation Verifiability:** Each test query mapped to these documents evaluates retrieval accuracy, section grounding, and citation authenticity.
