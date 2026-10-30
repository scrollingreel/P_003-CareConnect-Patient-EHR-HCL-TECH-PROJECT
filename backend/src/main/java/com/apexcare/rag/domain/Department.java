package com.apexcare.rag.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "departments")
public class Department {
    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String icon;

    @Column(name = "head_doctor", length = 100)
    private String headDoctor;

    @Column(length = 100)
    private String floor;

    public Department() {}

    public Department(String id, String name, String description, String icon, String headDoctor, String floor) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.headDoctor = headDoctor;
        this.floor = floor;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getIcon() { return icon; }
    public String getHeadDoctor() { return headDoctor; }
    public String getFloor() { return floor; }

    public void setId(String id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setIcon(String icon) { this.icon = icon; }
    public void setHeadDoctor(String headDoctor) { this.headDoctor = headDoctor; }
    public void setFloor(String floor) { this.floor = floor; }
}
