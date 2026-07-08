package com.school.auth.management;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public final class ManagementDtos {
    private ManagementDtos() {
    }

    public record SnapshotResponse(
            List<StudentResponse> students,
            List<TeacherResponse> teachers,
            List<ExamResponse> exams,
            List<NotificationResponse> notifications,
            List<StudentItemResponse> studentItems,
            List<DocumentResponse> documents
    ) {
    }

    public record StudentResponse(
            UUID id,
            String admissionNo,
            String name,
            String parentName,
            String guardianPhone,
            String guardianEmail,
            String dateOfBirth,
            String gender,
            String address,
            String className,
            String section,
            Integer attendance,
            String feeStatus,
            BigDecimal annualFee,
            BigDecimal amountPaid
    ) {
    }

    public record CreateStudentRequest(
            @NotBlank String admissionNo,
            @NotBlank String name,
            @NotBlank String parentName,
            String guardianPhone,
            String guardianEmail,
            String dateOfBirth,
            String gender,
            @NotBlank String address,
            @NotBlank String className,
            @NotBlank String section,
            @NotNull @Min(0) @Max(100) Integer attendance,
            @NotBlank String feeStatus,
            @NotNull @Positive BigDecimal annualFee,
            @NotNull @Min(0) BigDecimal amountPaid
    ) {
    }

    public record UpdateStudentRequest(
            @NotBlank String name,
            @NotBlank String parentName,
            String guardianPhone,
            String guardianEmail,
            String dateOfBirth,
            String gender,
            @NotBlank String address,
            @NotBlank String className,
            @NotBlank String section,
            @NotNull @Positive BigDecimal annualFee,
            @NotNull @Min(0) BigDecimal amountPaid
    ) {
    }

    public record AttendanceRequest(@NotNull @Min(0) @Max(100) Integer attendance) {
    }

    public record PaymentRequest(@NotNull @Positive BigDecimal amount) {
    }

    public record TeacherResponse(UUID id, String employeeNo, String name, String subject, String classes, String phone, String email, String qualification, String joiningDate) {
    }

    public record CreateTeacherRequest(
            @NotBlank String employeeNo,
            @NotBlank String name,
            @NotBlank String subject,
            @NotBlank String classes,
            @NotBlank String phone,
            String email,
            String qualification,
            String joiningDate
    ) {
    }

    public record UpdateTeacherRequest(
            @NotBlank String employeeNo,
            @NotBlank String name,
            @NotBlank String subject,
            @NotBlank String classes,
            @NotBlank String phone,
            String email,
            String qualification,
            String joiningDate
    ) {
    }

    public record ExamResponse(UUID id, String name, String className, String status, String resultCards) {
    }

    public record CreateExamRequest(@NotBlank String name, @NotBlank String className, @NotBlank String status, @NotBlank String resultCards) {
    }

    public record UpdateExamRequest(@NotBlank String name, @NotBlank String className, @NotBlank String status, @NotBlank String resultCards) {
    }

    public record NotificationResponse(UUID id, String title, String className, String person, String status) {
    }

    public record CreateNotificationRequest(@NotBlank String title, @NotBlank String className, @NotBlank String person, @NotBlank String status) {
    }

    public record UpdateNotificationRequest(@NotBlank String title, @NotBlank String className, @NotBlank String person, @NotBlank String status) {
    }

    public record StudentItemResponse(
            UUID id,
            UUID studentId,
            String studentName,
            String studentAdmissionNo,
            String className,
            String itemName,
            String itemType,
            Integer quantity,
            String providedDate,
            String notes,
            String status
    ) {
    }

    public record CreateStudentItemRequest(
            @NotNull UUID studentId,
            @NotBlank String itemName,
            @NotBlank String itemType,
            @NotNull @Min(1) Integer quantity,
            @NotBlank String providedDate,
            String notes,
            @NotBlank String status
    ) {
    }

    public record UpdateStudentItemRequest(
            @NotBlank String itemName,
            @NotBlank String itemType,
            @NotNull @Min(1) Integer quantity,
            @NotBlank String providedDate,
            String notes,
            @NotBlank String status
    ) {
    }

    public record DocumentResponse(
            UUID id,
            String ownerType,
            String ownerName,
            String ownerIdentifier,
            String documentTitle,
            String documentType,
            String notes,
            String fileName,
            String contentType,
            Long sizeBytes,
            String uploadedAt
    ) {
    }
}
