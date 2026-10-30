package com.apexcare.rag.repository;

import com.apexcare.rag.domain.PatientVital;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientVitalRepository extends JpaRepository<PatientVital, UUID> {
    List<PatientVital> findAllByPatientIdOrderByDateDesc(String patientId);
}
