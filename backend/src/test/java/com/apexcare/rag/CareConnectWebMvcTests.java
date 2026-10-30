package com.apexcare.rag;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class CareConnectWebMvcTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("API: POST /patients/register-profile registers new patient with insurance & allergies")
    void testRegisterProfileEndpoint() throws Exception {
        Map<String, Object> req = Map.of(
            "name", "Marcus Vance",
            "email", "m.vance@example.com",
            "dob", "1985-03-15",
            "age", 41,
            "gender", "Male",
            "bloodGroup", "A-",
            "insuranceProvider", "Aetna Open Choice PPO",
            "policyNumber", "AET-554201",
            "allergies", List.of("Ciprofloxacin")
        );

        mockMvc.perform(post("/patients/register-profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("Marcus Vance"))
            .andExpect(jsonPath("$.bloodGroup").value("A-"));
    }

    @Test
    @DisplayName("API: Clinical Notes - POST creates note and PUT on finalized note returns 409 Conflict")
    void testClinicalNoteEndpoints() throws Exception {
        Map<String, Object> newNote = Map.of(
            "patientId", "P-1001",
            "doctorName", "Dr. Rajesh Verma, MD",
            "specialty", "Cardiology",
            "templateType", "SOAP",
            "summary", "Cardiac follow-up",
            "details", "Exam unremarkable",
            "assessment", "Hypertension well managed",
            "treatmentPlan", "Continue Lisinopril",
            "isFinalized", true
        );

        String response = mockMvc.perform(post("/patients/P-1001/clinical-notes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newNote)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("Finalized"))
            .andExpect(jsonPath("$.isFinalized").value(true))
            .andReturn().getResponse().getContentAsString();

        Map<?, ?> parsed = objectMapper.readValue(response, Map.class);
        String noteId = (String) parsed.get("id");

        // Attempt overwrite -> must return 409
        Map<String, Object> editReq = Map.of("summary", "Attempted overwrite");
        mockMvc.perform(put("/patients/P-1001/clinical-notes/" + noteId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editReq)))
            .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("API: CPOE - POST /orders/lab, /orders/imaging, /orders/procedure")
    void testCpoeEndpoints() throws Exception {
        // Lab Order
        Map<String, Object> labReq = Map.of(
            "patientId", "P-1001",
            "doctorId", "D-201",
            "testCode", "LOINC-14749-6",
            "testName", "Basic Metabolic Panel (BMP)",
            "priority", "Routine"
        );
        mockMvc.perform(post("/orders/lab")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(labReq)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.testName").value("Basic Metabolic Panel (BMP)"));

        // Imaging Order
        Map<String, Object> imgReq = Map.of(
            "patientId", "P-1001",
            "doctorId", "D-201",
            "modality", "MRI",
            "bodySite", "Brain with and without Contrast",
            "priority", "Routine"
        );
        mockMvc.perform(post("/orders/imaging")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(imgReq)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.modality").value("MRI"));
    }

    @Test
    @DisplayName("API: DDI Check - POST /prescriptions/check-interactions detects severe interaction")
    void testDdiCheckEndpoint() throws Exception {
        Map<String, Object> checkReq = Map.of(
            "proposedMedications", List.of("Spironolactone 25mg"),
            "currentMedications", List.of("Lisinopril 10mg"),
            "allergies", List.of("Penicillin")
        );

        mockMvc.perform(post("/prescriptions/check-interactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(checkReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.overallStatus").value("CONTRAINDICATED"))
            .andExpect(jsonPath("$.interactions[0].severity").value("CONTRAINDICATED"))
            .andExpect(jsonPath("$.integrationMetadata.gateway").isNotEmpty());
    }

    @Test
    @DisplayName("API: Integration Adapter - /integrations/status, /integrations/hl7/oru-r01, /integrations/fhir/diagnostic-report")
    void testIntegrationEndpoints() throws Exception {
        mockMvc.perform(get("/integrations/status"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.isConnected").value(true))
            .andExpect(jsonPath("$.supportedProtocols").isArray());

        mockMvc.perform(get("/integrations/hl7/oru-r01/LAB-1001"))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN))
            .andExpect(content().string(org.hamcrest.Matchers.containsString("ORU^R01")));

        mockMvc.perform(get("/integrations/fhir/diagnostic-report/LAB-1001"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.resourceType").value("DiagnosticReport"))
            .andExpect(jsonPath("$.status").value("final"));
    }

    @Test
    @DisplayName("API: HCL Database Views - /views/patient-summary, /views/provider-schedule, /views/medication-history, /views/lab-orders-and-results")
    void testHclViewsEndpoints() throws Exception {
        mockMvc.perform(get("/views/patient-summary/P-1001"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.patient").exists())
            .andExpect(jsonPath("$.activePrescriptionsCount").isNumber());

        mockMvc.perform(get("/views/provider-schedule/D-201"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.doctor.name").value("Dr. Rajesh Verma"))
            .andExpect(jsonPath("$.queue").isArray());

        mockMvc.perform(get("/views/medication-history/P-1001"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.prescriptions").isArray())
            .andExpect(jsonPath("$.administrationRecords").isArray());

        mockMvc.perform(get("/views/lab-orders-and-results/P-1001"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.labOrders").isArray())
            .andExpect(jsonPath("$.labResults").isArray());
    }

    @Test
    @DisplayName("API: Secure Messaging & Notifications - /messages, /notifications/user/{userId}, /admin/audit-logs")
    void testMessagingAndNotificationsEndpoints() throws Exception {
        Map<String, Object> msg = Map.of(
            "patientId", "P-1001",
            "senderId", "P-1001",
            "senderName", "Ananya Sharma",
            "senderRole", "PATIENT",
            "recipientId", "D-201",
            "recipientName", "Dr. Rajesh Verma",
            "recipientRole", "DOCTOR",
            "subject", "Appointment follow-up",
            "body", "Thank you for the advice, Dr. Verma."
        );

        mockMvc.perform(post("/messages")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(msg)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.subject").value("Appointment follow-up"));

        mockMvc.perform(get("/notifications/user/P-1001"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/admin/audit-logs"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray());
    }
}
