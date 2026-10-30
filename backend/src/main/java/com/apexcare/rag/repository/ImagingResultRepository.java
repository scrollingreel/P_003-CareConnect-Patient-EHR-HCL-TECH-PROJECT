package com.apexcare.rag.repository;

import com.apexcare.rag.domain.ImagingResult;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImagingResultRepository extends JpaRepository<ImagingResult, String> {
    List<ImagingResult> findAllByPatientIdOrderByCreatedAtDesc(String patientId);
    List<ImagingResult> findAllByOrderIdOrderByCreatedAtDesc(String orderId);
}
