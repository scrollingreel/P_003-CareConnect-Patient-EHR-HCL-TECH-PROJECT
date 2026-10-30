package com.apexcare.rag.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "medications_catalog")
public class MedicationCatalog {
    @Id
    @Column(length = 50)
    private String id;

    @Column(length = 50, unique = true)
    private String code;

    @Column(name = "generic_name", nullable = false, length = 150)
    private String genericName;

    @Column(name = "brand_name", length = 150)
    private String brandName;

    @Column(name = "dosage_forms", length = 100)
    private String dosageForms;

    @Column(name = "standard_strength", length = 50)
    private String standardStrength;

    @Column(name = "therapeutic_class", length = 100)
    private String therapeuticClass;

    @Column(name = "requires_prescription")
    private Boolean requiresPrescription = true;

    public MedicationCatalog() {}

    public MedicationCatalog(String id, String code, String genericName, String brandName,
                             String dosageForms, String standardStrength,
                             String therapeuticClass, Boolean requiresPrescription) {
        this.id = id;
        this.code = code;
        this.genericName = genericName;
        this.brandName = brandName;
        this.dosageForms = dosageForms;
        this.standardStrength = standardStrength;
        this.therapeuticClass = therapeuticClass;
        this.requiresPrescription = requiresPrescription != null ? requiresPrescription : true;
    }

    public String getId() { return id; }
    public String getCode() { return code; }
    public String getGenericName() { return genericName; }
    public String getBrandName() { return brandName; }
    public String getDosageForms() { return dosageForms; }
    public String getStandardStrength() { return standardStrength; }
    public String getTherapeuticClass() { return therapeuticClass; }
    public Boolean getRequiresPrescription() { return requiresPrescription; }

    public void setId(String id) { this.id = id; }
    public void setCode(String code) { this.code = code; }
    public void setGenericName(String genericName) { this.genericName = genericName; }
    public void setBrandName(String brandName) { this.brandName = brandName; }
    public void setDosageForms(String dosageForms) { this.dosageForms = dosageForms; }
    public void setStandardStrength(String standardStrength) { this.standardStrength = standardStrength; }
    public void setTherapeuticClass(String therapeuticClass) { this.therapeuticClass = therapeuticClass; }
    public void setRequiresPrescription(Boolean requiresPrescription) { this.requiresPrescription = requiresPrescription; }
}
