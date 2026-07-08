package com.school.auth.management;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "management_exams")
public class ManagementExam {
    @Id
    private UUID id;
    @Column(nullable = false)
    private UUID schoolId;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String className;
    @Column(nullable = false)
    private String status;
    @Column(nullable = false)
    private String resultCards;
    private OffsetDateTime createdAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getSchoolId() { return schoolId; }
    public void setSchoolId(UUID schoolId) { this.schoolId = schoolId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getResultCards() { return resultCards; }
    public void setResultCards(String resultCards) { this.resultCards = resultCards; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
