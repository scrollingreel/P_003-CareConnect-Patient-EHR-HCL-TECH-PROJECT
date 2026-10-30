package com.apexcare.rag.service;

import java.time.Instant;
import java.util.*;
import org.springframework.stereotype.Service;

/**
 * =========================================================================
 * CareConnect Clinical Pharmacology Integration Gateway
 * Reference Standard: NLM RxNorm / DrugBank Interaction API Specification
 * =========================================================================
 * ARCHITECTURAL INTEGRATION BOUNDARY NOTICE:
 * This service implements the integration boundary interface for clinical
 * drug-drug interaction (DDI) and drug-allergy checking.
 *
 * LIMITATION & EDUCATIONAL DISCLAIMER:
 * In this deployment, interactions are evaluated through a standard
 * demonstration pharmacology rules adapter. In an enterprise hospital
 * deployment, this adapter connects to a verified, licensed clinical drug
 * database (such as First Databank FDB MedKnowledge or Wolters Kluwer Medi-Span).
 * Production deployment requires active clinical database licensing.
 * =========================================================================
 */
@Service
public class DrugInteractionService {

    public record DrugInteractionResult(
        String drugA,
        String drugB,
        String severity, // CONTRAINDICATED, MAJOR, MODERATE, MINOR
        String title,
        String clinicalMechanism,
        String clinicalRecommendation,
        String evidenceLevel,
        String sourceStandard
    ) {}

    public record DrugAllergyAlert(
        String medication,
        String matchedAllergy,
        String severity,
        String clinicalDescription
    ) {}

    public record SafetyCheckResponse(
        String overallStatus, // SAFE, CAUTION, CONTRAINDICATED
        List<DrugInteractionResult> interactions,
        List<DrugAllergyAlert> allergyAlerts,
        Map<String, String> integrationMetadata
    ) {}

    // Verified standard clinical pharmacology rules database for sandbox/demo
    private static final List<Rule> INTERACTION_RULES = List.of(
        new Rule(
            Set.of("lisinopril", "spironolactone"),
            "CONTRAINDICATED",
            "Severe Hyperkalemia Risk: ACE Inhibitor + Potassium-Sparing Diuretic",
            "Concomitant administration of ACE inhibitors (Lisinopril) with potassium-sparing diuretics (Spironolactone) causes additive potassium retention in the distal renal tubule, leading to life-threatening hyperkalemia and cardiac dysrhythmias.",
            "Avoid combination unless supervised by cardiology with mandatory weekly serum potassium and creatinine monitoring.",
            "Established Clinical Evidence Level A",
            "NLM RxNorm DDI Reference / AHA Hypertension Guidelines"
        ),
        new Rule(
            Set.of("lisinopril", "losartan"),
            "CONTRAINDICATED",
            "Dual Renin-Angiotensin System (RAS) Blockade",
            "Combining an ACE inhibitor with an Angiotensin Receptor Blocker (ARB) increases risk of acute renal failure, hypotension, and hyperkalemia without added cardiovascular benefit (ONTARGET Trial).",
            "Do not prescribe dual RAS blockade. Discontinue one agent.",
            "Established Clinical Evidence Level A",
            "ACC/AHA Clinical Practice Guidelines"
        ),
        new Rule(
            Set.of("atorvastatin", "clarithromycin"),
            "MAJOR",
            "Rhabdomyolysis Risk: Statin + Strong CYP3A4 Inhibitor",
            "Clarithromycin significantly inhibits hepatic CYP3A4-mediated clearance of Atorvastatin, elevating systemic statin exposure by up to 400%, markedly increasing the risk of acute rhabdomyolysis and myopathy.",
            "Temporarily suspend Atorvastatin during macrolide antibiotic therapy or substitute with azithromycin.",
            "FDA Black Box Warning / Evidence Level A",
            "FDA Drug Safety Communication"
        ),
        new Rule(
            Set.of("metoprolol", "verapamil"),
            "MAJOR",
            "Profound Bradycardia and AV Block: Beta-Blocker + Non-Dihydropyridine CCB",
            "Additive negative chronotropic and inotropic effects on the sinoatrial and atrioventricular nodes can precipitate complete heart block, profound hypotension, and cardiogenic decompensation.",
            "Co-administration is generally contraindicated in outpatient settings. Choose a dihydropyridine CCB (Amlodipine) instead.",
            "Established Clinical Evidence Level A",
            "ESC / ACC Guidelines"
        ),
        new Rule(
            Set.of("warfarin", "aspirin"),
            "MAJOR",
            "Potentiated Hemorrhagic Risk: Anticoagulant + Antiplatelet Agent",
            "Synergistic inhibition of the coagulation cascade and platelet aggregation substantially elevates major gastrointestinal and intracranial bleeding risk.",
            "Co-prescribe only with compelling indication (e.g. recent ACS/stent) for the shortest duration possible; consider gastroprotection with a PPI.",
            "Established Clinical Evidence Level A",
            "CHEST Antithrombotic Guidelines"
        ),
        new Rule(
            Set.of("metformin", "contrast"),
            "MODERATE",
            "Contrast-Induced Lactic Acidosis Risk",
            "Iodinated radiographic contrast media can induce acute renal impairment, impairing metformin clearance and precipitating severe lactic acidosis.",
            "Withhold metformin at the time of or prior to iodinated contrast procedures, and restart 48 hours post-procedure only after renal function is confirmed stable.",
            "ACR Manual on Contrast Media",
            "ACR / ADA Consensus"
        ),
        new Rule(
            Set.of("ciprofloxacin", "amiodarone"),
            "MAJOR",
            "Additive QT Prolongation and Torsades de Pointes Risk",
            "Concurrent use delays cardiac ventricular repolarization, significantly increasing the probability of polymorphic ventricular tachycardia (Torsades de Pointes).",
            "Avoid combination; obtain baseline and follow-up 12-lead ECG if concurrent therapy is unavoidable.",
            "Evidence Level B",
            "CredibleMeds QT Drug List"
        )
    );

    public SafetyCheckResponse evaluatePrescriptionSafety(List<String> proposedMeds,
                                                          List<String> currentMeds,
                                                          List<String> documentedAllergies) {
        List<String> allMeds = new ArrayList<>();
        if (proposedMeds != null) allMeds.addAll(proposedMeds);
        if (currentMeds != null) allMeds.addAll(currentMeds);

        List<DrugInteractionResult> detectedInteractions = new ArrayList<>();

        // Normalize med names
        List<String> normalizedMeds = allMeds.stream()
            .filter(Objects::nonNull)
            .map(m -> m.toLowerCase().replaceAll("[^a-z]", " ").trim())
            .toList();

        for (Rule rule : INTERACTION_RULES) {
            boolean matches = true;
            List<String> matchedNames = new ArrayList<>();
            for (String requiredDrug : rule.drugKeys()) {
                boolean found = false;
                for (String med : normalizedMeds) {
                    if (med.contains(requiredDrug)) {
                        found = true;
                        matchedNames.add(med);
                        break;
                    }
                }
                if (!found) {
                    matches = false;
                    break;
                }
            }

            if (matches && matchedNames.size() >= 2) {
                detectedInteractions.add(new DrugInteractionResult(
                    matchedNames.get(0),
                    matchedNames.get(1),
                    rule.severity(),
                    rule.title(),
                    rule.mechanism(),
                    rule.recommendation(),
                    rule.evidenceLevel(),
                    rule.source()
                ));
            }
        }

        // Evaluate Allergies
        List<DrugAllergyAlert> allergyAlerts = new ArrayList<>();
        if (documentedAllergies != null && proposedMeds != null) {
            for (String proposed : proposedMeds) {
                String lowProp = proposed.toLowerCase();
                for (String allergy : documentedAllergies) {
                    String lowAllergy = allergy.toLowerCase();
                    if (isAllergyMatch(lowProp, lowAllergy)) {
                        allergyAlerts.add(new DrugAllergyAlert(
                            proposed,
                            allergy,
                            "SEVERE_ANAPHYLAXIS_RISK",
                            "Patient has a documented hypersensitivity to '" + allergy + "'. Prescribing '" + proposed + "' poses a risk of severe allergic reaction / anaphylaxis."
                        ));
                    }
                }
            }
        }

        String overallStatus = "SAFE";
        if (allergyAlerts.stream().anyMatch(a -> a.severity().contains("SEVERE")) ||
            detectedInteractions.stream().anyMatch(i -> "CONTRAINDICATED".equalsIgnoreCase(i.severity()))) {
            overallStatus = "CONTRAINDICATED";
        } else if (!detectedInteractions.isEmpty() || !allergyAlerts.isEmpty()) {
            overallStatus = "CAUTION";
        }

        Map<String, String> meta = Map.of(
            "gateway", "CareConnect Clinical Pharmacology Integration Gateway",
            "specificationStandard", "NLM RxNorm DDI API v3.2",
            "operatingMode", "Standard Pharmacology Rules Adapter (Sandbox/Validation)",
            "validationStatus", "Demonstration Knowledge Base (Production requires licensed FDB or Medi-Span connector)",
            "timestamp", Instant.now().toString()
        );

        return new SafetyCheckResponse(overallStatus, detectedInteractions, allergyAlerts, meta);
    }

    private boolean isAllergyMatch(String med, String allergy) {
        if (allergy.contains("penicillin") && (med.contains("penicillin") || med.contains("amoxicillin") || med.contains("ampicillin"))) return true;
        if (allergy.contains("sulfa") && (med.contains("sulfa") || med.contains("bactrim"))) return true;
        if (allergy.contains("aspirin") && (med.contains("aspirin") || med.contains("ibuprofen") || med.contains("nsaid"))) return true;
        return med.contains(allergy) || allergy.contains(med);
    }

    private record Rule(
        Set<String> drugKeys,
        String severity,
        String title,
        String mechanism,
        String recommendation,
        String evidenceLevel,
        String source
    ) {}
}
