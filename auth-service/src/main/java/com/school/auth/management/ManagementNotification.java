package com.school.auth.management;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "management_notifications")
public class ManagementNotification {
    @Id
    private UUID id;
    @Column(nullable = false)
    private UUID schoolId;
    @Column(nullable = false)
    private String title;
    @Column(nullable = false)
    private String className;
    @Column(nullable = false)
    private String person;
    @Column(nullable = false)
    private String status;
    private OffsetDateTime createdAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getSchoolId() { return schoolId; }
    public void setSchoolId(UUID schoolId) { this.schoolId = schoolId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public String getPerson() { return person; }
    public void setPerson(String person) { this.person = person; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
