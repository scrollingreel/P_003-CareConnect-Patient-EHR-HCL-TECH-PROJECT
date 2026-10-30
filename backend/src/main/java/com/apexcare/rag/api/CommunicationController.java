package com.apexcare.rag.api;

import com.apexcare.rag.api.dto.HospitalDtos;
import com.apexcare.rag.domain.AuditLog;
import com.apexcare.rag.domain.PatientNotification;
import com.apexcare.rag.domain.SecureMessage;
import com.apexcare.rag.service.HospitalService;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
public class CommunicationController {
    private final HospitalService hospitalService;

    public CommunicationController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    // --- Epic 7: Secure Messaging ---
    @GetMapping("/messages/patient/{patientId}")
    public List<SecureMessage> getPatientMessages(@PathVariable String patientId) {
        return hospitalService.getPatientMessages(patientId);
    }

    @PostMapping("/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public SecureMessage sendMessage(@RequestBody HospitalDtos.SecureMessageRequest request) {
        return hospitalService.sendSecureMessage(request);
    }

    @PatchMapping("/messages/{id}/read")
    public Map<String, Object> markMessageRead(@PathVariable String id) {
        hospitalService.markMessageRead(id);
        return Map.of("success", true, "id", id);
    }

    // --- Epic 6 & 7: System Notifications ---
    @GetMapping("/notifications/user/{userId}")
    public List<PatientNotification> getNotifications(@PathVariable String userId) {
        return hospitalService.getNotifications(userId);
    }

    @PatchMapping("/notifications/{id}/read")
    public Map<String, Object> markNotificationRead(@PathVariable String id) {
        hospitalService.markNotificationRead(id);
        return Map.of("success", true, "id", id);
    }

    // --- Epic 6: System Audit Logs ---
    @GetMapping("/admin/audit-logs")
    public List<AuditLog> getAuditLogs() {
        return hospitalService.getAuditLogs();
    }

    // --- HCL View 2: ProviderSchedule ---
    @GetMapping("/views/provider-schedule/{doctorId}")
    public Map<String, Object> getProviderSchedule(@PathVariable String doctorId,
                                                   @RequestParam(required = false) String date) {
        return hospitalService.getProviderSchedule(doctorId, date);
    }
}
