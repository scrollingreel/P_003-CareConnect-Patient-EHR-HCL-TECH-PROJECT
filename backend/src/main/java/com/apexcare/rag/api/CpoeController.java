package com.apexcare.rag.api;

import com.apexcare.rag.api.dto.HospitalDtos;
import com.apexcare.rag.domain.*;
import com.apexcare.rag.repository.*;
import com.apexcare.rag.service.HospitalService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
public class CpoeController {
    private final HospitalService hospitalService;
    private final LabOrderRepository labOrderRepository;
    private final ImagingOrderRepository imagingOrderRepository;
    private final ProcedureOrderRepository procedureOrderRepository;
    private final LabResultRepository labResultRepository;
    private final ImagingResultRepository imagingResultRepository;

    public CpoeController(HospitalService hospitalService,
                          LabOrderRepository labOrderRepository,
                          ImagingOrderRepository imagingOrderRepository,
                          ProcedureOrderRepository procedureOrderRepository,
                          LabResultRepository labResultRepository,
                          ImagingResultRepository imagingResultRepository) {
        this.hospitalService = hospitalService;
        this.labOrderRepository = labOrderRepository;
        this.imagingOrderRepository = imagingOrderRepository;
        this.procedureOrderRepository = procedureOrderRepository;
        this.labResultRepository = labResultRepository;
        this.imagingResultRepository = imagingResultRepository;
    }

    // --- Laboratory Orders (Epic 3 & Epic 5) ---
    @PostMapping("/orders/lab")
    @ResponseStatus(HttpStatus.CREATED)
    public LabOrder createLabOrder(@RequestBody HospitalDtos.LabOrderRequest request) {
        return hospitalService.orderLabTest(request);
    }

    @GetMapping("/orders/lab/patient/{patientId}")
    public List<LabOrder> getLabOrdersByPatient(@PathVariable String patientId) {
        return labOrderRepository.findAllByPatientIdOrderByCreatedAtDesc(patientId);
    }

    // --- Imaging Orders (Epic 3 & Epic 5) ---
    @PostMapping("/orders/imaging")
    @ResponseStatus(HttpStatus.CREATED)
    public ImagingOrder createImagingOrder(@RequestBody HospitalDtos.ImagingOrderRequest request) {
        return hospitalService.orderImaging(request);
    }

    @GetMapping("/orders/imaging/patient/{patientId}")
    public List<ImagingOrder> getImagingOrdersByPatient(@PathVariable String patientId) {
        return imagingOrderRepository.findAllByPatientIdOrderByCreatedAtDesc(patientId);
    }

    // --- Procedure Orders (Epic 3) ---
    @PostMapping("/orders/procedure")
    @ResponseStatus(HttpStatus.CREATED)
    public ProcedureOrder createProcedureOrder(@RequestBody HospitalDtos.ProcedureOrderRequest request) {
        return hospitalService.orderProcedure(request);
    }

    @GetMapping("/orders/procedure/patient/{patientId}")
    public List<ProcedureOrder> getProcedureOrdersByPatient(@PathVariable String patientId) {
        return procedureOrderRepository.findAllByPatientIdOrderByCreatedAtDesc(patientId);
    }

    // --- Diagnostic Results & Critical Panic Alerts (Epic 5) ---
    @PostMapping("/results/lab")
    @ResponseStatus(HttpStatus.CREATED)
    public LabResult recordLabResult(@RequestBody HospitalDtos.LabResultRequest request) {
        return hospitalService.recordLabResult(request);
    }

    @GetMapping("/results/lab/patient/{patientId}")
    public List<LabResult> getLabResultsByPatient(@PathVariable String patientId) {
        return labResultRepository.findAllByPatientIdOrderByCreatedAtDesc(patientId);
    }

    @PostMapping("/results/imaging")
    @ResponseStatus(HttpStatus.CREATED)
    public ImagingResult recordImagingResult(@RequestBody HospitalDtos.ImagingResultRequest request) {
        return hospitalService.recordImagingResult(request);
    }

    @GetMapping("/results/imaging/patient/{patientId}")
    public List<ImagingResult> getImagingResultsByPatient(@PathVariable String patientId) {
        return imagingResultRepository.findAllByPatientIdOrderByCreatedAtDesc(patientId);
    }
}
