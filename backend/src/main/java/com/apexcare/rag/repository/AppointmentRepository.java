package com.apexcare.rag.repository;

import com.apexcare.rag.domain.Appointment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, String> {
    List<Appointment> findAllByPatientIdOrderByAppointmentDateDesc(String patientId);
    List<Appointment> findAllByDoctorIdOrderByAppointmentDateDesc(String doctorId);
}
