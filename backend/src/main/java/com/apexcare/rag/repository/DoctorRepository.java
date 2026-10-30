package com.apexcare.rag.repository;

import com.apexcare.rag.domain.Doctor;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, String> {
    List<Doctor> findAllByDepartmentId(String departmentId);
    Optional<Doctor> findByEmailIgnoreCase(String email);
}
