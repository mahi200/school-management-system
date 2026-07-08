package com.school.auth.application.dto;

import java.util.Set;
import java.util.UUID;

public record CurrentUserResponse(
        UUID userId,
        UUID schoolId,
        String email,
        Set<String> roles
) {
}

