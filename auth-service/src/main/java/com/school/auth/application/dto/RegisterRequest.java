package com.school.auth.application.dto;

import com.school.auth.domain.model.RoleName;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record RegisterRequest(
        @NotBlank String schoolCode,
        @NotBlank @Size(max = 140) String fullName,
        @Email @NotBlank String email,
        @NotBlank @Size(min = 8, max = 120) String password,
        @NotEmpty Set<RoleName> roles
) {
}

