package com.apexcare.rag.api;

import com.apexcare.rag.api.dto.HospitalDtos;
import com.apexcare.rag.domain.ClinicalNote;
import com.apexcare.rag.service.HospitalService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class PatientRecordController {
    private final HospitalService hospitalService;

    public PatientRecordController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    @GetMapping("/patients/{patientId}/records")
    public Map<String, Object> getPatientRecord(@PathVariable String patientId) {
        return hospitalService.getPatientMedicalRecord(patientId);
    }

    @GetMapping("/doctors/{doctorId}/patients/{patientId}/records")
    public Map<String, Object> getPatientRecordForDoctor(@PathVariable String doctorId,
                                                         @PathVariable String patientId) {
        return hospitalService.getPatientMedicalRecord(patientId);
    }

    @PostMapping(value = "/patients/{patientId}/reports", consumes = {"multipart/form-data"})
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> uploadReportMultipart(
        @PathVariable String patientId,
        @RequestParam(value = "file", required = false) MultipartFile file,
        @RequestParam(value = "title", required = false) String title,
        @RequestParam(value = "category", required = false) String category,
        @RequestParam(value = "notes", required = false) String notes
    ) {
        Map<String, Object> data = new HashMap<>();
        data.put("title", title != null ? title : (file != null ? file.getOriginalFilename() : "Diagnostic Report"));
        data.put("category", category != null ? category : "Laboratory Pathology");
        data.put("rawContent", notes != null ? notes : "Patient uploaded report");
        if (file != null) {
            data.put("fileName", file.getOriginalFilename());
            data.put("fileSize", (file.getSize() / 1024) + " KB");
            data.put("fileType", file.getOriginalFilename() != null && file.getOriginalFilename().toLowerCase().endsWith(".pdf") ? "PDF" : "Image");
        }
        return hospitalService.uploadReport(patientId, data);
    }

    @PostMapping(value = "/patients/{patientId}/reports", consumes = {"application/json"})
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> uploadReportJson(
        @PathVariable String patientId,
        @RequestBody Map<String, Object> body
    ) {
        return hospitalService.uploadReport(patientId, body);
    }

    @PostMapping("/reports/{reportId}/summarize")
    public HospitalDtos.ReportSummaryResponse summarizeReport(@PathVariable String reportId) {
        return hospitalService.summarizeReport(reportId);
    }

    @PutMapping("/patients/profile")
    public Map<String, Object> updateProfile(@RequestBody Map<String, Object> profileData) {
        return hospitalService.updateProfile("P-1001", profileData);
    }

    // --- HCL Business Operation 1: RegisterPatient ---
    @PostMapping("/patients/register-profile")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> registerPatientProfile(@RequestBody Map<String, Object> patientData) {
        return hospitalService.registerPatientProfile(patientData);
    }

    // --- HCL Epic 2: Clinical Documentation & Notes ---
    @GetMapping("/patients/{patientId}/clinical-notes")
    public List<ClinicalNote> getPatientClinicalNotes(@PathVariable String patientId) {
        return hospitalService.getPatientClinicalNotes(patientId);
    }

    @PostMapping("/patients/{patientId}/clinical-notes")
    @ResponseStatus(HttpStatus.CREATED)
    public ClinicalNote createEncounterNote(@PathVariable String patientId,
                                            @RequestBody HospitalDtos.ClinicalNoteRequest request) {
        return hospitalService.createEncounterNote(request);
    }

    @PutMapping("/patients/{patientId}/clinical-notes/{noteId}")
    public ClinicalNote updateEncounterNote(@PathVariable String patientId,
                                            @PathVariable String noteId,
                                            @RequestBody HospitalDtos.ClinicalNoteRequest request) {
        return hospitalService.updateEncounterNote(noteId, request);
    }

    // --- HCL Database Views ---
    @GetMapping("/views/patient-summary/{patientId}")
    public Map<String, Object> getPatientSummary(@PathVariable String patientId) {
        return hospitalService.getPatientSummary(patientId);
    }

    @GetMapping("/views/medication-history/{patientId}")
    public Map<String, Object> getMedicationHistory(@PathVariable String patientId) {
        return hospitalService.getMedicationHistory(patientId);
    }

    @GetMapping("/views/lab-orders-and-results/{patientId}")
    public Map<String, Object> getLabOrdersAndResults(@PathVariable String patientId) {
        return hospitalService.getLabOrdersAndResults(patientId);
    }
}
