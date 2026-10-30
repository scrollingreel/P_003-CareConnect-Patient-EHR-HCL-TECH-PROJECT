package com.apexcare.rag.api;

import com.apexcare.rag.domain.Department;
import com.apexcare.rag.service.HospitalService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/departments")
public class DepartmentController {
    private final HospitalService hospitalService;

    public DepartmentController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    @GetMapping
    public List<Department> list() {
        return hospitalService.getDepartments();
    }
}
