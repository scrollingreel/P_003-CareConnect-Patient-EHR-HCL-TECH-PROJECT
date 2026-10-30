package com.apexcare.rag.api;

import com.apexcare.rag.api.dto.HospitalDtos;
import com.apexcare.rag.domain.Appointment;
import com.apexcare.rag.service.HospitalService;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
public class AppointmentController {
    private final HospitalService hospitalService;

    public AppointmentController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    @PostMapping("/appointments")
    @ResponseStatus(HttpStatus.CREATED)
    public Appointment book(@RequestBody HospitalDtos.AppointmentRequest request) {
        return hospitalService.bookAppointment(request);
    }

    @GetMapping("/patients/{patientId}/appointments")
    public List<Appointment> getPatientAppointments(@PathVariable String patientId) {
        return hospitalService.getPatientAppointments(patientId);
    }

    @PatchMapping("/appointments/{id}/cancel")
    public Map<String, Object> cancel(@PathVariable String id,
                                      @RequestBody(required = false) HospitalDtos.AppointmentCancelRequest request) {
        String reason = request != null ? request.effectiveReason() : "Cancelled by patient";
        return hospitalService.cancelAppointment(id, reason);
    }

    @PatchMapping("/appointments/{id}/reschedule")
    public Map<String, Object> reschedule(@PathVariable String id,
                                          @RequestBody HospitalDtos.AppointmentRescheduleRequest request) {
        return hospitalService.rescheduleAppointment(id, request.effectiveDate(), request.effectiveTime());
    }
}
