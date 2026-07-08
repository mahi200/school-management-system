package com.school.auth.application.dto;

import java.util.Set;
import java.util.UUID;

public record UserResponse(
        UUID id,
        UUID schoolId,
        String schoolCode,
        String fullName,
        String email,
        Set<String> roles,
        String status
) {
}

