package com.apexcare.rag.repository;

import com.apexcare.rag.domain.MedicationCatalog;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicationCatalogRepository extends JpaRepository<MedicationCatalog, String> {
    Optional<MedicationCatalog> findByCode(String code);
    List<MedicationCatalog> findByGenericNameContainingIgnoreCaseOrBrandNameContainingIgnoreCase(String generic, String brand);
}
