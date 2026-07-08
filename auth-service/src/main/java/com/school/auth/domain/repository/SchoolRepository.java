package com.school.auth.domain.repository;

import com.school.auth.domain.model.School;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SchoolRepository extends JpaRepository<School, UUID> {
    Optional<School> findByCodeIgnoreCase(String code);
}

