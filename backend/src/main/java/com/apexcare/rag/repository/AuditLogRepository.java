package com.apexcare.rag.repository;

import com.apexcare.rag.domain.AuditLog;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findAllByUserIdOrderByCreatedAtDesc(String userId);
    List<AuditLog> findAllByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, String entityId);
    List<AuditLog> findTop50ByOrderByCreatedAtDesc();
}
