package com.school.auth.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank String schoolCode,
        @Email @NotBlank String email,
        @NotBlank String password
) {
}

