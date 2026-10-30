package com.apexcare.rag.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "doctors")
public class Doctor {
    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String title;

    @Column(name = "department_id", length = 50)
    private String departmentId;

    @Column(name = "department_name", length = 100)
    private String departmentName;

    @Column(length = 150)
    private String specialization;

    @Column(name = "experience_years")
    private Integer experienceYears;

    private Double rating;

    @Column(name = "review_count")
    private Integer reviewCount;

    @Column(name = "consultation_fee")
    private Double consultationFee;

    @Column(length = 254)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(length = 100)
    private String room;

    @Column(name = "availability_days", columnDefinition = "TEXT")
    private String availabilityDays; // Comma-separated: Monday, Tuesday, ...

    @Column(length = 100)
    private String timings;

    @Column(columnDefinition = "TEXT")
    private String avatar;

    public Doctor() {}

    public Doctor(String id, String name, String title, String departmentId, String departmentName,
                  String specialization, Integer experienceYears, Double rating, Integer reviewCount,
                  Double consultationFee, String email, String phone, String room,
                  String availabilityDays, String timings, String avatar) {
        this.id = id;
        this.name = name;
        this.title = title;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.specialization = specialization;
        this.experienceYears = experienceYears;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.consultationFee = consultationFee;
        this.email = email;
        this.phone = phone;
        this.room = room;
        this.availabilityDays = availabilityDays;
        this.timings = timings;
        this.avatar = avatar;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getTitle() { return title; }
    public String getDepartmentId() { return departmentId; }
    public String getDepartmentName() { return departmentName; }
    public String getSpecialization() { return specialization; }
    public Integer getExperienceYears() { return experienceYears; }
    public Double getRating() { return rating; }
    public Integer getReviewCount() { return reviewCount; }
    public Double getConsultationFee() { return consultationFee; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getRoom() { return room; }
    public List<String> getAvailabilityDays() {
        if (availabilityDays == null || availabilityDays.isBlank()) {
            return List.of();
        }
        return Arrays.stream(availabilityDays.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .toList();
    }
    public String getRawAvailabilityDays() { return availabilityDays; }
    public String getTimings() { return timings; }
    public String getAvatar() { return avatar; }

    public void setId(String id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setTitle(String title) { this.title = title; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }
    public void setRating(Double rating) { this.rating = rating; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
    public void setConsultationFee(Double consultationFee) { this.consultationFee = consultationFee; }
    public void setEmail(String email) { this.email = email; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setRoom(String room) { this.room = room; }
    public void setAvailabilityDays(String availabilityDays) { this.availabilityDays = availabilityDays; }
    public void setTimings(String timings) { this.timings = timings; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
}
