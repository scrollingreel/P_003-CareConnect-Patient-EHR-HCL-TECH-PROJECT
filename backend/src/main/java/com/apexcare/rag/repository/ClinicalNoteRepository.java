package com.apexcare.rag.repository;

import com.apexcare.rag.domain.ClinicalNote;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClinicalNoteRepository extends JpaRepository<ClinicalNote, String> {
    List<ClinicalNote> findAllByPatientIdOrderByDateDesc(String patientId);
}
