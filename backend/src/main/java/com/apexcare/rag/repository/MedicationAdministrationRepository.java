package com.apexcare.rag.repository;

import com.apexcare.rag.domain.MedicationAdministration;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicationAdministrationRepository extends JpaRepository<MedicationAdministration, String> {
    List<MedicationAdministration> findAllByPatientIdOrderByScheduledTimeDesc(String patientId);
    List<MedicationAdministration> findAllByPrescriptionIdOrderByScheduledTimeDesc(String prescriptionId);
}
