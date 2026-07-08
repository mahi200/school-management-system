package com.school.auth.management;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ManagementNotificationRepository extends JpaRepository<ManagementNotification, UUID> {
    List<ManagementNotification> findBySchoolIdOrderByCreatedAtDesc(UUID schoolId);
    Optional<ManagementNotification> findByIdAndSchoolId(UUID id, UUID schoolId);
    void deleteByIdAndSchoolId(UUID id, UUID schoolId);
}
