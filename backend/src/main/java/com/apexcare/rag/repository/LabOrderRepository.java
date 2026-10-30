package com.apexcare.rag.repository;

import com.apexcare.rag.domain.LabOrder;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LabOrderRepository extends JpaRepository<LabOrder, String> {
    List<LabOrder> findAllByPatientIdOrderByCreatedAtDesc(String patientId);
    List<LabOrder> findAllByDoctorIdOrderByCreatedAtDesc(String doctorId);
    List<LabOrder> findAllByStatusOrderByCreatedAtDesc(String status);
}
