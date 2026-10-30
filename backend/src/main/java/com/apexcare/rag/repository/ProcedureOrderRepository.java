package com.apexcare.rag.repository;

import com.apexcare.rag.domain.ProcedureOrder;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProcedureOrderRepository extends JpaRepository<ProcedureOrder, String> {
    List<ProcedureOrder> findAllByPatientIdOrderByCreatedAtDesc(String patientId);
    List<ProcedureOrder> findAllByDoctorIdOrderByCreatedAtDesc(String doctorId);
}
