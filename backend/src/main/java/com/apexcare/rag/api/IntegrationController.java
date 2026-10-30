package com.apexcare.rag.api;

import com.apexcare.rag.service.DiagnosticIntegrationAdapter;
import com.apexcare.rag.service.HospitalService;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/integrations")
public class IntegrationController {
    private final HospitalService hospitalService;

    public IntegrationController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    @GetMapping("/status")
    public DiagnosticIntegrationAdapter.IntegrationStatusResponse getStatus() {
        return hospitalService.getIntegrationStatus();
    }

    @GetMapping(value = "/hl7/oru-r01/{orderId}", produces = MediaType.TEXT_PLAIN_VALUE)
    public String getHl7OruMessage(@PathVariable String orderId) {
        return hospitalService.getHl7OruMessage(orderId);
    }

    @GetMapping("/fhir/diagnostic-report/{orderId}")
    public Map<String, Object> getFhirDiagnosticReport(@PathVariable String orderId) {
        return hospitalService.getFhirDiagnosticReport(orderId);
    }
}
