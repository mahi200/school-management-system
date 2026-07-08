package com.school.auth.management;

import com.school.auth.infrastructure.security.AppPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import static com.school.auth.management.ManagementDtos.*;

@RestController
@RequestMapping("/api/v1/management")
public class ManagementController {
    private final ManagementStudentRepository students;
    private final ManagementTeacherRepository teachers;
    private final ManagementExamRepository exams;
    private final ManagementNotificationRepository notifications;
    private final ManagementStudentItemRepository studentItems;
    private final ManagementDocumentRepository documents;

    public ManagementController(
            ManagementStudentRepository students,
            ManagementTeacherRepository teachers,
            ManagementExamRepository exams,
            ManagementNotificationRepository notifications,
            ManagementStudentItemRepository studentItems,
            ManagementDocumentRepository documents
    ) {
        this.students = students;
        this.teachers = teachers;
        this.exams = exams;
        this.notifications = notifications;
        this.studentItems = studentItems;
        this.documents = documents;
    }

    @GetMapping("/snapshot")
    SnapshotResponse snapshot(@AuthenticationPrincipal AppPrincipal principal) {
        return new SnapshotResponse(
                students.findBySchoolIdOrderByCreatedAtDesc(principal.schoolId()).stream().map(this::studentResponse).toList(),
                teachers.findBySchoolIdOrderByCreatedAtDesc(principal.schoolId()).stream().map(this::teacherResponse).toList(),
                exams.findBySchoolIdOrderByCreatedAtDesc(principal.schoolId()).stream().map(this::examResponse).toList(),
                notifications.findBySchoolIdOrderByCreatedAtDesc(principal.schoolId()).stream().map(this::notificationResponse).toList(),
                studentItems.findBySchoolIdOrderByCreatedAtDesc(principal.schoolId()).stream().map(this::studentItemResponse).toList(),
                documents.findBySchoolIdOrderByUploadedAtDesc(principal.schoolId()).stream().map(this::documentResponse).toList()
        );
    }

    @PostMapping("/students")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    StudentResponse createStudent(@AuthenticationPrincipal AppPrincipal principal, @Valid @RequestBody CreateStudentRequest request) {
        ManagementStudent student = new ManagementStudent();
        student.setId(UUID.randomUUID());
        student.setSchoolId(principal.schoolId());
        student.setAdmissionNo(request.admissionNo());
        student.setName(request.name());
        student.setParentName(request.parentName());
        student.setGuardianPhone(request.guardianPhone() != null ? request.guardianPhone() : "");
        student.setGuardianEmail(request.guardianEmail() != null ? request.guardianEmail() : "");
        student.setDateOfBirth(request.dateOfBirth() != null ? request.dateOfBirth() : "");
        student.setGender(request.gender() != null ? request.gender() : "Male");
        student.setAddress(request.address());
        student.setClassName(request.className());
        student.setSection(request.section());
        student.setAttendance(request.attendance());
        student.setAnnualFee(request.annualFee());
        student.setAmountPaid(request.amountPaid().min(request.annualFee()));
        student.setFeeStatus(feeStatus(student.getAnnualFee(), student.getAmountPaid()));
        student.setCreatedAt(OffsetDateTime.now());
        student.setUpdatedAt(OffsetDateTime.now());
        return studentResponse(students.save(student));
    }

    @PutMapping("/students/{id}")
    @Transactional
    StudentResponse updateStudent(@AuthenticationPrincipal AppPrincipal principal, @PathVariable UUID id, @Valid @RequestBody UpdateStudentRequest request) {
        ManagementStudent student = studentOrThrow(id, principal.schoolId());
        student.setName(request.name());
        student.setParentName(request.parentName());
        student.setGuardianPhone(request.guardianPhone() != null ? request.guardianPhone() : "");
        student.setGuardianEmail(request.guardianEmail() != null ? request.guardianEmail() : "");
        student.setDateOfBirth(request.dateOfBirth() != null ? request.dateOfBirth() : "");
        student.setGender(request.gender() != null ? request.gender() : "Male");
        student.setAddress(request.address());
        student.setClassName(request.className());
        student.setSection(request.section());
        student.setAnnualFee(request.annualFee());
        BigDecimal nextPaid = request.amountPaid().min(request.annualFee());
        student.setAmountPaid(nextPaid);
        student.setFeeStatus(feeStatus(request.annualFee(), nextPaid));
        student.setUpdatedAt(OffsetDateTime.now());
        return studentResponse(students.save(student));
    }

    @PatchMapping("/students/{id}/attendance")
    @Transactional
    StudentResponse updateAttendance(@AuthenticationPrincipal AppPrincipal principal, @PathVariable UUID id, @Valid @RequestBody AttendanceRequest request) {
        ManagementStudent student = studentOrThrow(id, principal.schoolId());
        student.setAttendance(request.attendance());
        student.setUpdatedAt(OffsetDateTime.now());
        return studentResponse(students.save(student));
    }

    @PostMapping("/students/{id}/payments")
    @Transactional
    StudentResponse recordPayment(@AuthenticationPrincipal AppPrincipal principal, @PathVariable UUID id, @Valid @RequestBody PaymentRequest request) {
        ManagementStudent student = studentOrThrow(id, principal.schoolId());
        BigDecimal nextPaid = student.getAmountPaid().add(request.amount()).min(student.getAnnualFee());
        student.setAmountPaid(nextPaid);
        student.setFeeStatus(feeStatus(student.getAnnualFee(), nextPaid));
        student.setUpdatedAt(OffsetDateTime.now());
        return studentResponse(students.save(student));
    }

    @PostMapping("/teachers")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    TeacherResponse createTeacher(@AuthenticationPrincipal AppPrincipal principal, @Valid @RequestBody CreateTeacherRequest request) {
        ManagementTeacher teacher = new ManagementTeacher();
        teacher.setId(UUID.randomUUID());
        teacher.setSchoolId(principal.schoolId());
        teacher.setEmployeeNo(request.employeeNo());
        teacher.setName(request.name());
        teacher.setSubject(request.subject());
        teacher.setClasses(request.classes());
        teacher.setPhone(request.phone());
        teacher.setEmail(request.email() != null ? request.email() : "");
        teacher.setQualification(request.qualification() != null ? request.qualification() : "");
        teacher.setJoiningDate(request.joiningDate() != null ? request.joiningDate() : "");
        teacher.setCreatedAt(OffsetDateTime.now());
        teacher.setUpdatedAt(OffsetDateTime.now());
        return teacherResponse(teachers.save(teacher));
    }

    @PutMapping("/teachers/{id}")
    @Transactional
    TeacherResponse updateTeacher(@AuthenticationPrincipal AppPrincipal principal, @PathVariable UUID id, @Valid @RequestBody UpdateTeacherRequest request) {
        ManagementTeacher teacher = teachers.findByIdAndSchoolId(id, principal.schoolId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher not found"));
        teacher.setEmployeeNo(request.employeeNo());
        teacher.setName(request.name());
        teacher.setSubject(request.subject());
        teacher.setClasses(request.classes());
        teacher.setPhone(request.phone());
        teacher.setEmail(request.email() != null ? request.email() : "");
        teacher.setQualification(request.qualification() != null ? request.qualification() : "");
        teacher.setJoiningDate(request.joiningDate() != null ? request.joiningDate() : "");
        teacher.setUpdatedAt(OffsetDateTime.now());
        return teacherResponse(teachers.save(teacher));
    }

    @PutMapping("/exams/{id}")
    @Transactional
    ExamResponse updateExam(@AuthenticationPrincipal AppPrincipal principal, @PathVariable UUID id, @Valid @RequestBody UpdateExamRequest request) {
        ManagementExam exam = exams.findByIdAndSchoolId(id, principal.schoolId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found"));
        exam.setName(request.name());
        exam.setClassName(request.className());
        exam.setStatus(request.status());
        exam.setResultCards(request.resultCards());
        return examResponse(exams.save(exam));
    }

    @PutMapping("/notifications/{id}")
    @Transactional
    NotificationResponse updateNotification(@AuthenticationPrincipal AppPrincipal principal, @PathVariable UUID id, @Valid @RequestBody UpdateNotificationRequest request) {
        ManagementNotification notification = notifications.findByIdAndSchoolId(id, principal.schoolId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        notification.setTitle(request.title());
        notification.setClassName(request.className());
        notification.setPerson(request.person());
        notification.setStatus(request.status());
        return notificationResponse(notifications.save(notification));
    }

    @PostMapping("/exams")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    ExamResponse createExam(@AuthenticationPrincipal AppPrincipal principal, @Valid @RequestBody CreateExamRequest request) {
        ManagementExam exam = new ManagementExam();
        exam.setId(UUID.randomUUID());
        exam.setSchoolId(principal.schoolId());
        exam.setName(request.name());
        exam.setClassName(request.className());
        exam.setStatus(request.status());
        exam.setResultCards(request.resultCards());
        exam.setCreatedAt(OffsetDateTime.now());
        return examResponse(exams.save(exam));
    }

    @PostMapping("/notifications")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    NotificationResponse createNotification(@AuthenticationPrincipal AppPrincipal principal, @Valid @RequestBody CreateNotificationRequest request) {
        ManagementNotification notification = new ManagementNotification();
        notification.setId(UUID.randomUUID());
        notification.setSchoolId(principal.schoolId());
        notification.setTitle(request.title());
        notification.setClassName(request.className());
        notification.setPerson(request.person());
        notification.setStatus(request.status());
        notification.setCreatedAt(OffsetDateTime.now());
        return notificationResponse(notifications.save(notification));
    }

    @DeleteMapping("/students/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    void deleteStudent(@AuthenticationPrincipal AppPrincipal principal, @PathVariable UUID id) {
        ManagementStudent student = studentOrThrow(id, principal.schoolId());
        students.delete(student);
    }

    @DeleteMapping("/teachers/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    void deleteTeacher(@AuthenticationPrincipal AppPrincipal principal, @PathVariable UUID id) {
        ManagementTeacher teacher = teachers.findByIdAndSchoolId(id, principal.schoolId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher not found"));
        teachers.delete(teacher);
    }

    @DeleteMapping("/exams/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    void deleteExam(@AuthenticationPrincipal AppPrincipal principal, @PathVariable UUID id) {
        ManagementExam exam = exams.findByIdAndSchoolId(id, principal.schoolId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found"));
        exams.delete(exam);
    }

    @DeleteMapping("/notifications/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    void deleteNotification(@AuthenticationPrincipal AppPrincipal principal, @PathVariable UUID id) {
        ManagementNotification notification = notifications.findByIdAndSchoolId(id, principal.schoolId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        notifications.delete(notification);
    }

    @PostMapping("/student-items")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    StudentItemResponse createStudentItem(@AuthenticationPrincipal AppPrincipal principal, @Valid @RequestBody CreateStudentItemRequest request) {
        ManagementStudent student = studentOrThrow(request.studentId(), principal.schoolId());
        ManagementStudentItem item = new ManagementStudentItem();
        item.setId(UUID.randomUUID());
        item.setSchoolId(principal.schoolId());
        item.setStudentId(student.getId());
        item.setStudentName(student.getName());
        item.setStudentAdmissionNo(student.getAdmissionNo());
        item.setClassName(student.getClassName());
        item.setItemName(request.itemName());
        item.setItemType(request.itemType());
        item.setQuantity(request.quantity());
        item.setProvidedDate(request.providedDate());
        item.setNotes(request.notes() != null ? request.notes() : "");
        item.setStatus(request.status());
        item.setCreatedAt(OffsetDateTime.now());
        item.setUpdatedAt(OffsetDateTime.now());
        return studentItemResponse(studentItems.save(item));
    }

    @PutMapping("/student-items/{id}")
    @Transactional
    StudentItemResponse updateStudentItem(@AuthenticationPrincipal AppPrincipal principal, @PathVariable UUID id, @Valid @RequestBody UpdateStudentItemRequest request) {
        ManagementStudentItem item = studentItemOrThrow(id, principal.schoolId());
        item.setItemName(request.itemName());
        item.setItemType(request.itemType());
        item.setQuantity(request.quantity());
        item.setProvidedDate(request.providedDate());
        item.setNotes(request.notes() != null ? request.notes() : "");
        item.setStatus(request.status());
        item.setUpdatedAt(OffsetDateTime.now());
        return studentItemResponse(studentItems.save(item));
    }

    @DeleteMapping("/student-items/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    void deleteStudentItem(@AuthenticationPrincipal AppPrincipal principal, @PathVariable UUID id) {
        ManagementStudentItem item = studentItemOrThrow(id, principal.schoolId());
        studentItems.delete(item);
    }

    @PostMapping(value = "/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    DocumentResponse uploadDocument(
            @AuthenticationPrincipal AppPrincipal principal,
            @RequestParam String ownerType,
            @RequestParam String ownerName,
            @RequestParam String ownerIdentifier,
            @RequestParam String documentTitle,
            @RequestParam String documentType,
            @RequestParam(required = false, defaultValue = "") String notes,
            @RequestParam MultipartFile file
    ) throws IOException {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document file is required");
        }
        ManagementDocument document = new ManagementDocument();
        document.setId(UUID.randomUUID());
        document.setSchoolId(principal.schoolId());
        document.setOwnerType(ownerType);
        document.setOwnerName(ownerName);
        document.setOwnerIdentifier(ownerIdentifier);
        document.setDocumentTitle(documentTitle);
        document.setDocumentType(documentType);
        document.setNotes(notes);
        document.setFileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "document");
        document.setContentType(file.getContentType() != null ? file.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE);
        document.setSizeBytes(file.getSize());
        document.setFileData(file.getBytes());
        document.setUploadedAt(OffsetDateTime.now());
        return documentResponse(documents.save(document));
    }

    @GetMapping("/documents/{id}/download")
    @Transactional(readOnly = true)
    ResponseEntity<byte[]> downloadDocument(@AuthenticationPrincipal AppPrincipal principal, @PathVariable UUID id) {
        ManagementDocument document = documentOrThrow(id, principal.schoolId());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(document.getContentType()))
                .contentLength(document.getSizeBytes())
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(document.getFileName()).build().toString())
                .body(document.getFileData());
    }

    @DeleteMapping("/documents/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    void deleteDocument(@AuthenticationPrincipal AppPrincipal principal, @PathVariable UUID id) {
        ManagementDocument document = documentOrThrow(id, principal.schoolId());
        documents.delete(document);
    }

    private ManagementStudent studentOrThrow(UUID id, UUID schoolId) {
        return students.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
    }

    private String feeStatus(BigDecimal annualFee, BigDecimal amountPaid) {
        BigDecimal due = annualFee.subtract(amountPaid).max(BigDecimal.ZERO);
        if (due.compareTo(BigDecimal.ZERO) == 0) {
            return "Paid";
        }
        return due.compareTo(annualFee.multiply(new BigDecimal("0.5"))) > 0 ? "Overdue" : "Pending";
    }

    private StudentResponse studentResponse(ManagementStudent student) {
        return new StudentResponse(student.getId(), student.getAdmissionNo(), student.getName(), student.getParentName(),
                student.getGuardianPhone(), student.getGuardianEmail(), student.getDateOfBirth(), student.getGender(),
                student.getAddress(), student.getClassName(), student.getSection(), student.getAttendance(),
                student.getFeeStatus(), student.getAnnualFee(), student.getAmountPaid());
    }

    private TeacherResponse teacherResponse(ManagementTeacher teacher) {
        return new TeacherResponse(teacher.getId(), teacher.getEmployeeNo(), teacher.getName(), teacher.getSubject(), teacher.getClasses(), teacher.getPhone(),
                teacher.getEmail(), teacher.getQualification(), teacher.getJoiningDate());
    }

    private ExamResponse examResponse(ManagementExam exam) {
        return new ExamResponse(exam.getId(), exam.getName(), exam.getClassName(), exam.getStatus(), exam.getResultCards());
    }

    private NotificationResponse notificationResponse(ManagementNotification notification) {
        return new NotificationResponse(notification.getId(), notification.getTitle(), notification.getClassName(), notification.getPerson(), notification.getStatus());
    }

    private ManagementStudentItem studentItemOrThrow(UUID id, UUID schoolId) {
        return studentItems.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student item not found"));
    }

    private StudentItemResponse studentItemResponse(ManagementStudentItem item) {
        return new StudentItemResponse(
                item.getId(),
                item.getStudentId(),
                item.getStudentName(),
                item.getStudentAdmissionNo(),
                item.getClassName(),
                item.getItemName(),
                item.getItemType(),
                item.getQuantity(),
                item.getProvidedDate(),
                item.getNotes(),
                item.getStatus()
        );
    }

    private ManagementDocument documentOrThrow(UUID id, UUID schoolId) {
        return documents.findByIdAndSchoolId(id, schoolId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
    }

    private DocumentResponse documentResponse(ManagementDocument document) {
        return new DocumentResponse(
                document.getId(),
                document.getOwnerType(),
                document.getOwnerName(),
                document.getOwnerIdentifier(),
                document.getDocumentTitle(),
                document.getDocumentType(),
                document.getNotes(),
                document.getFileName(),
                document.getContentType(),
                document.getSizeBytes(),
                document.getUploadedAt() != null ? document.getUploadedAt().toString() : ""
        );
    }
}
