package com.apexcare.rag.repository;

import com.apexcare.rag.domain.PatientReport;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientReportRepository extends JpaRepository<PatientReport, String> {
    List<PatientReport> findAllByPatientIdOrderByDateDesc(String patientId);
}
