package com.apexcare.rag.repository;

import com.apexcare.rag.domain.PatientNotification;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientNotificationRepository extends JpaRepository<PatientNotification, String> {
    List<PatientNotification> findAllByUserIdOrderByCreatedAtDesc(String userId);
    List<PatientNotification> findAllByRecipientRoleOrderByCreatedAtDesc(String recipientRole);
    long countByUserIdAndIsReadFalse(String userId);
}
