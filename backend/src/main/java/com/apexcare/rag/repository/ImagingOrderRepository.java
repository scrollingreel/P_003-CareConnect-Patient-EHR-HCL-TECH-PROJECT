package com.apexcare.rag.repository;

import com.apexcare.rag.domain.ImagingOrder;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImagingOrderRepository extends JpaRepository<ImagingOrder, String> {
    List<ImagingOrder> findAllByPatientIdOrderByCreatedAtDesc(String patientId);
    List<ImagingOrder> findAllByDoctorIdOrderByCreatedAtDesc(String doctorId);
}
