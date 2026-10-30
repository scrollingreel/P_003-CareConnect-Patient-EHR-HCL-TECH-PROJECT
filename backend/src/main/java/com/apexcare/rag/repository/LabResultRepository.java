package com.apexcare.rag.repository;

import com.apexcare.rag.domain.LabResult;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LabResultRepository extends JpaRepository<LabResult, String> {
    List<LabResult> findAllByPatientIdOrderByCreatedAtDesc(String patientId);
    List<LabResult> findAllByOrderIdOrderByCreatedAtDesc(String orderId);
    List<LabResult> findAllByPatientIdAndIsCriticalTrueOrderByCreatedAtDesc(String patientId);
}
