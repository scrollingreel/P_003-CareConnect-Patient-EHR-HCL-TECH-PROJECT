package com.apexcare.rag.service;

import com.apexcare.rag.domain.LabOrder;
import com.apexcare.rag.domain.LabResult;
import com.apexcare.rag.domain.ImagingOrder;
import com.apexcare.rag.domain.ImagingResult;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import org.springframework.stereotype.Service;

/**
 * =========================================================================
 * CareConnect Diagnostic Systems Integration Adapter
 * Supports: REST API, HL7 v2.5.1 (ORU^R01 / OML^O21), FHIR R4, LIS & PACS
 * =========================================================================
 * MODULAR INTEGRATION ADAPTER NOTICE:
 * This adapter provides standardized transformation pipelines for diagnostic
 * data exchange between CareConnect EHR and external Laboratory Information
 * Systems (LIS) and Picture Archiving and Communication Systems (PACS).
 *
 * OPERATING MODE: Clearly Labelled Demonstration / Sandbox Adapter.
 * Conforms to HL7 v2.5.1 and HL7 FHIR Release 4 specification standards.
 * =========================================================================
 */
@Service
public class DiagnosticIntegrationAdapter {

    private static final DateTimeFormatter HL7_DATE_FMT =
        DateTimeFormatter.ofPattern("yyyyMMddHHmmss").withZone(ZoneId.of("UTC"));

    public record IntegrationStatusResponse(
        String systemName,
        String environment,
        boolean isConnected,
        String lisStatus,
        String pacsStatus,
        List<String> supportedProtocols,
        Map<String, String> activeEndpoints,
        String disclaimer
    ) {}

    public IntegrationStatusResponse getStatus() {
        return new IntegrationStatusResponse(
            "CareConnect EHR Diagnostic Gateway",
            "Sandbox / Demonstration Gateway",
            true,
            "LIS Connected (Simulated HL7 v2.5.1 ORU/OML Bridge)",
            "PACS Connected (Simulated DICOM Accession & Web Viewer Bridge)",
            List.of("REST API (JSON)", "HL7 v2.5.1 MSH/PID/OBR/OBX", "HL7 FHIR R4 (Observation/DiagnosticReport)", "DICOM WADO-RS Preview"),
            Map.of(
                "hl7OrderEndpoint", "/api/integrations/hl7/oml-o21",
                "hl7ResultEndpoint", "/api/integrations/hl7/oru-r01",
                "fhirDiagnosticReport", "/api/integrations/fhir/DiagnosticReport/{id}",
                "fhirObservation", "/api/integrations/fhir/Observation/{id}",
                "pacsViewer", "https://pacs.apexcare.org/viewer/{accessionNumber}"
            ),
            "NOTICE: Modular sandbox adapter for academic & verification demonstrations. Conforms to HL7 v2.5.1 and FHIR R4 data models."
        );
    }

    /**
     * Generate compliant HL7 v2.5.1 ORU^R01 message string for a Lab Result.
     */
    public String generateHl7OruR01Message(LabOrder order, LabResult result, String patientName, String dob, String gender) {
        String timestamp = HL7_DATE_FMT.format(Instant.now());
        String msgId = "MSG-" + UUID.randomUUID().toString().substring(0, 8);

        StringBuilder sb = new StringBuilder();
        // MSH - Message Header
        sb.append("MSH|^~\\&|APEXCARE_LIS|CENTRAL_LAB|CARECONNECT_EHR|OPD_CLINIC|")
          .append(timestamp).append("||ORU^R01|").append(msgId).append("|P|2.5.1\r\n");

        // PID - Patient Identification
        sb.append("PID|1||").append(order.getPatientId()).append("||")
          .append(patientName != null ? patientName.replace(" ", "^") : "PATIENT^UNKNOWN")
          .append("||").append(dob != null ? dob.replace("-", "") : "19880101").append("|")
          .append(gender != null && gender.toLowerCase().startsWith("f") ? "F" : "M").append("\r\n");

        // OBR - Observation Request
        sb.append("OBR|1|").append(order.getId()).append("|LIS-").append(order.getId()).append("|")
          .append(order.getTestCode() != null ? order.getTestCode() : "LAB-TEST").append("^")
          .append(order.getTestName()).append("^LN|||").append(timestamp).append("|||")
          .append(order.getDoctorId() != null ? order.getDoctorId() : "D-201").append("|||||||||||F\r\n");

        // OBX - Observation / Result Segment
        sb.append("OBX|1|ST|").append(result.getParameterName()).append("^").append(result.getParameterName())
          .append("|1|").append(result.getResultValue()).append("|").append(result.getUnit() != null ? result.getUnit() : "")
          .append("|").append(result.getReferenceRange() != null ? result.getReferenceRange() : "").append("|")
          .append(Boolean.TRUE.equals(result.getIsCritical()) ? "HH" : (result.getAbnormalFlag() != null ? result.getAbnormalFlag() : "N"))
          .append("|||F|||").append(timestamp).append("\r\n");

        return sb.toString();
    }

    /**
     * Generate HL7 FHIR Release 4 DiagnosticReport resource JSON.
     */
    public Map<String, Object> generateFhirDiagnosticReport(LabOrder order, List<LabResult> results, String patientName) {
        Map<String, Object> fhir = new LinkedHashMap<>();
        fhir.put("resourceType", "DiagnosticReport");
        fhir.put("id", order.getId());
        fhir.put("status", "final");
        fhir.put("category", List.of(Map.of(
            "coding", List.of(Map.of(
                "system", "http://terminology.hl7.org/CodeSystem/v2-0074",
                "code", "LAB",
                "display", "Laboratory"
            ))
        )));
        fhir.put("code", Map.of(
            "coding", List.of(Map.of(
                "system", "http://loinc.org",
                "code", order.getTestCode() != null ? order.getTestCode() : "98000-1",
                "display", order.getTestName()
            )),
            "text", order.getTestName()
        ));
        fhir.put("subject", Map.of(
            "reference", "Patient/" + order.getPatientId(),
            "display", patientName != null ? patientName : "Patient " + order.getPatientId()
        ));
        fhir.put("effectiveDateTime", Instant.now().toString());
        fhir.put("issued", Instant.now().toString());

        List<Map<String, Object>> observations = new ArrayList<>();
        if (results != null) {
            for (LabResult res : results) {
                Map<String, Object> obs = new LinkedHashMap<>();
                obs.put("resourceType", "Observation");
                obs.put("id", res.getId());
                obs.put("status", "final");
                obs.put("code", Map.of("text", res.getParameterName()));
                obs.put("valueQuantity", Map.of(
                    "value", res.getResultValue(),
                    "unit", res.getUnit() != null ? res.getUnit() : ""
                ));
                if (res.getReferenceRange() != null) {
                    obs.put("referenceRange", List.of(Map.of("text", res.getReferenceRange())));
                }
                obs.put("interpretation", List.of(Map.of(
                    "text", Boolean.TRUE.equals(res.getIsCritical()) ? "Critical Alert" : (res.getAbnormalFlag() != null ? res.getAbnormalFlag() : "Normal")
                )));
                observations.add(obs);
            }
        }
        fhir.put("contained", observations);

        return fhir;
    }

    /**
     * PACS DICOM Metadata Simulation.
     */
    public Map<String, Object> generatePacsStudyMetadata(ImagingOrder order, ImagingResult result) {
        return Map.of(
            "sopClassUID", "1.2.840.10008.5.1.4.1.1.7",
            "studyInstanceUID", "1.2.840.113619.2.55.3." + System.currentTimeMillis(),
            "seriesInstanceUID", "1.2.840.113619.2.55.4." + (System.currentTimeMillis() + 1),
            "accessionNumber", order.getPacsAccessionNumber() != null ? order.getPacsAccessionNumber() : "ACC-" + order.getId(),
            "modality", order.getModality(),
            "bodyPartExamined", order.getBodySite(),
            "studyDescription", result != null ? result.getStudyTitle() : order.getModality() + " Examination",
            "pacsWebPreviewUrl", "https://pacs.apexcare.org/viewer?accession=" + order.getPacsAccessionNumber(),
            "isCriticalFinding", result != null && Boolean.TRUE.equals(result.getIsCritical())
        );
    }
}
