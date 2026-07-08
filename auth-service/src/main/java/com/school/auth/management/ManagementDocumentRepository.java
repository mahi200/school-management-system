package com.school.auth.management;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ManagementDocumentRepository extends JpaRepository<ManagementDocument, UUID> {
    List<ManagementDocument> findBySchoolIdOrderByUploadedAtDesc(UUID schoolId);
    Optional<ManagementDocument> findByIdAndSchoolId(UUID id, UUID schoolId);
}
