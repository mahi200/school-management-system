package com.school.auth.domain.repository;

import com.school.auth.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findBySchool_CodeIgnoreCaseAndEmailIgnoreCase(String schoolCode, String email);

    boolean existsBySchool_CodeIgnoreCaseAndEmailIgnoreCase(String schoolCode, String email);
}

