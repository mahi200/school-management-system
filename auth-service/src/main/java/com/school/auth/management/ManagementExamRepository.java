package com.school.auth.management;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ManagementExamRepository extends JpaRepository<ManagementExam, UUID> {
    List<ManagementExam> findBySchoolIdOrderByCreatedAtDesc(UUID schoolId);
    Optional<ManagementExam> findByIdAndSchoolId(UUID id, UUID schoolId);
    void deleteByIdAndSchoolId(UUID id, UUID schoolId);
}
