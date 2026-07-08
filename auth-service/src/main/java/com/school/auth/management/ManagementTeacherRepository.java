package com.school.auth.management;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ManagementTeacherRepository extends JpaRepository<ManagementTeacher, UUID> {
    List<ManagementTeacher> findBySchoolIdOrderByCreatedAtDesc(UUID schoolId);
    Optional<ManagementTeacher> findByIdAndSchoolId(UUID id, UUID schoolId);
    void deleteByIdAndSchoolId(UUID id, UUID schoolId);
}
