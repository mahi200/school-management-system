package com.school.auth.management;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ManagementStudentItemRepository extends JpaRepository<ManagementStudentItem, UUID> {
    List<ManagementStudentItem> findBySchoolIdOrderByCreatedAtDesc(UUID schoolId);
    Optional<ManagementStudentItem> findByIdAndSchoolId(UUID id, UUID schoolId);
}
