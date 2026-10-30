package com.apexcare.rag.repository;

import com.apexcare.rag.domain.SecureMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SecureMessageRepository extends JpaRepository<SecureMessage, String> {
    List<SecureMessage> findAllByPatientIdOrderByCreatedAtDesc(String patientId);
    List<SecureMessage> findAllByRecipientIdOrderByCreatedAtDesc(String recipientId);
    List<SecureMessage> findAllBySenderIdOrderByCreatedAtDesc(String senderId);
    long countByRecipientIdAndIsReadFalse(String recipientId);
}
