package com.apexcare.rag.repository;

import com.apexcare.rag.domain.HospitalDocument;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HospitalDocumentRepository extends JpaRepository<HospitalDocument, UUID> {
    Optional<HospitalDocument> findByContentHash(String contentHash);
    List<HospitalDocument> findAllByOrderByCreatedAtDesc();
}
