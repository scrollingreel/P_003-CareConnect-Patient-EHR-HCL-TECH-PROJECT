package com.apexcare.rag.repository;

import com.apexcare.rag.domain.Prescription;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, String> {
    List<Prescription> findAllByPatientIdOrderByDateDesc(String patientId);
    List<Prescription> findAllByDoctorIdOrderByDateDesc(String doctorId);
}
