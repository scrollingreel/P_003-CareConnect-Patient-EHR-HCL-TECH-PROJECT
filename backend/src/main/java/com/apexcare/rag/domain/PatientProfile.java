package com.apexcare.rag.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "patient_profiles")
public class PatientProfile {
    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 254)
    private String email;

    @Column(length = 20)
    private String dob;

    private Integer age;

    @Column(length = 20)
    private String gender;

    @Column(name = "blood_group", length = 10)
    private String bloodGroup;

    @Column(length = 50)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "emergency_contact_json", columnDefinition = "TEXT")
    private String emergencyContactJson;

    @Column(name = "insurance_json", columnDefinition = "TEXT")
    private String insuranceJson;

    @Column(name = "allergies_json", columnDefinition = "TEXT")
    private String allergiesJson;

    @Column(name = "chronic_conditions_json", columnDefinition = "TEXT")
    private String chronicConditionsJson;

    @Column(columnDefinition = "TEXT")
    private String avatar;

    public PatientProfile() {}

    public PatientProfile(String id, UUID userId, String name, String email, String dob,
                          Integer age, String gender, String bloodGroup, String phone,
                          String address, String emergencyContactJson, String insuranceJson,
                          String allergiesJson, String chronicConditionsJson, String avatar) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.dob = dob;
        this.age = age;
        this.gender = gender;
        this.bloodGroup = bloodGroup;
        this.phone = phone;
        this.address = address;
        this.emergencyContactJson = emergencyContactJson;
        this.insuranceJson = insuranceJson;
        this.allergiesJson = allergiesJson;
        this.chronicConditionsJson = chronicConditionsJson;
        this.avatar = avatar;
    }

    public String getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getDob() { return dob; }
    public Integer getAge() { return age; }
    public String getGender() { return gender; }
    public String getBloodGroup() { return bloodGroup; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public String getEmergencyContactJson() { return emergencyContactJson; }
    public String getInsuranceJson() { return insuranceJson; }
    public String getAllergiesJson() { return allergiesJson; }
    public String getChronicConditionsJson() { return chronicConditionsJson; }
    public String getAvatar() { return avatar; }

    public void setId(String id) { this.id = id; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setDob(String dob) { this.dob = dob; }
    public void setAge(Integer age) { this.age = age; }
    public void setGender(String gender) { this.gender = gender; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setAddress(String address) { this.address = address; }
    public void setEmergencyContactJson(String emergencyContactJson) { this.emergencyContactJson = emergencyContactJson; }
    public void setInsuranceJson(String insuranceJson) { this.insuranceJson = insuranceJson; }
    public void setAllergiesJson(String allergiesJson) { this.allergiesJson = allergiesJson; }
    public void setChronicConditionsJson(String chronicConditionsJson) { this.chronicConditionsJson = chronicConditionsJson; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
}
