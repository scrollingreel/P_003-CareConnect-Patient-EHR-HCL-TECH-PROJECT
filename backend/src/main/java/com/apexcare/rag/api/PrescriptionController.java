package com.apexcare.rag.api;

import com.apexcare.rag.api.dto.HospitalDtos;
import com.apexcare.rag.domain.MedicationAdministration;
import com.apexcare.rag.service.DrugInteractionService;
import com.apexcare.rag.service.HospitalService;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
public class PrescriptionController {
    private final HospitalService hospitalService;

    public PrescriptionController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    @GetMapping("/patients/{patientId}/prescriptions")
    public List<Map<String, Object>> getPatientPrescriptions(@PathVariable String patientId) {
        return hospitalService.getPatientPrescriptions(patientId);
    }

    @PostMapping("/prescriptions")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createPrescription(@RequestBody HospitalDtos.PrescriptionRequest request) {
        return hospitalService.createPrescription(request);
    }

    // Epic 4: Drug-Drug Interaction Safety Check Endpoint
    @PostMapping("/prescriptions/check-interactions")
    public DrugInteractionService.SafetyCheckResponse checkInteractions(
        @RequestBody HospitalDtos.PrescriptionSafetyCheckRequest request
    ) {
        return hospitalService.checkPrescriptionSafety(request);
    }

    // Epic 4: Medication Administration Record (MAR)
    @GetMapping("/patients/{patientId}/mar")
    public List<MedicationAdministration> getMarRecords(@PathVariable String patientId) {
        return hospitalService.getMedicationAdministrations(patientId);
    }

    @PostMapping("/patients/{patientId}/mar")
    @ResponseStatus(HttpStatus.CREATED)
    public MedicationAdministration recordMar(
        @PathVariable String patientId,
        @RequestBody HospitalDtos.MedicationAdministrationRequest request
    ) {
        return hospitalService.recordAdministration(request);
    }
}
