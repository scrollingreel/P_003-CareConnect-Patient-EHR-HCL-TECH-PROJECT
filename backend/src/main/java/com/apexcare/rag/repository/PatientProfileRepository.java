package com.apexcare.rag.repository;

import com.apexcare.rag.domain.PatientProfile;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientProfileRepository extends JpaRepository<PatientProfile, String> {
    Optional<PatientProfile> findByUserId(UUID userId);
    Optional<PatientProfile> findByEmailIgnoreCase(String email);
}
