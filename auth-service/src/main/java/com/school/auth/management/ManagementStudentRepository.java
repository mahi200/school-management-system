package com.school.auth.management;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ManagementStudentRepository extends JpaRepository<ManagementStudent, UUID> {
    List<ManagementStudent> findBySchoolIdOrderByCreatedAtDesc(UUID schoolId);
    Optional<ManagementStudent> findByIdAndSchoolId(UUID id, UUID schoolId);
    long countBySchoolId(UUID schoolId);
    void deleteByIdAndSchoolId(UUID id, UUID schoolId);
}
