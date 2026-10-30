package com.apexcare.rag.api;

import com.apexcare.rag.api.dto.HospitalDtos;
import com.apexcare.rag.domain.Appointment;
import com.apexcare.rag.domain.Doctor;
import com.apexcare.rag.service.HospitalService;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/doctors")
public class DoctorController {
    private final HospitalService hospitalService;

    public DoctorController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    @GetMapping
    public List<Doctor> list(@RequestParam(required = false) String departmentId) {
        return hospitalService.getDoctors(departmentId);
    }

    @GetMapping("/{doctorId}/slots")
    public List<HospitalDtos.SlotResponse> getSlots(@PathVariable String doctorId,
                                                    @RequestParam(required = false, defaultValue = "today") String date) {
        return hospitalService.getAvailableSlots(doctorId, date);
    }

    @GetMapping("/{doctorId}/patients")
    public List<HospitalDtos.DoctorPatientSummary> getDoctorPatients(@PathVariable String doctorId,
                                                                     @RequestParam(required = false) String search) {
        return hospitalService.getDoctorPatients(doctorId, search);
    }

    @GetMapping("/me/appointments")
    public List<Appointment> getMyAppointments() {
        return hospitalService.getDoctorAppointments("D-201");
    }

    @GetMapping("/me/prescriptions")
    public List<Map<String, Object>> getMyPrescriptions() {
        return hospitalService.getDoctorPrescriptions("D-201");
    }
}
