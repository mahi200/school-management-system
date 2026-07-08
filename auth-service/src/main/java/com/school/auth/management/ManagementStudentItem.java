package com.school.auth.management;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "management_student_items")
public class ManagementStudentItem {
    @Id
    private UUID id;
    @Column(nullable = false)
    private UUID schoolId;
    @Column(nullable = false)
    private UUID studentId;
    @Column(nullable = false)
    private String studentName;
    @Column(nullable = false)
    private String studentAdmissionNo;
    @Column(nullable = false)
    private String className;
    @Column(nullable = false)
    private String itemName;
    @Column(nullable = false)
    private String itemType;
    @Column(nullable = false)
    private Integer quantity;
    @Column(nullable = false)
    private String providedDate;
    @Column(nullable = false)
    private String notes;
    @Column(nullable = false)
    private String status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getSchoolId() { return schoolId; }
    public void setSchoolId(UUID schoolId) { this.schoolId = schoolId; }
    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getStudentAdmissionNo() { return studentAdmissionNo; }
    public void setStudentAdmissionNo(String studentAdmissionNo) { this.studentAdmissionNo = studentAdmissionNo; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }
    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getProvidedDate() { return providedDate; }
    public void setProvidedDate(String providedDate) { this.providedDate = providedDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
