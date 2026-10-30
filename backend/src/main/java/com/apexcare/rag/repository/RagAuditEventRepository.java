package com.apexcare.rag.repository;

import com.apexcare.rag.domain.RagAuditEvent;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RagAuditEventRepository extends JpaRepository<RagAuditEvent, UUID> {
    List<RagAuditEvent> findTop100ByOrderByCreatedAtDesc();
}
