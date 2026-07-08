package com.school.auth.adapter.in.web;

import com.school.auth.application.dto.AuthResponse;
import com.school.auth.application.dto.CurrentUserResponse;
import com.school.auth.application.dto.LoginRequest;
import com.school.auth.application.dto.RegisterRequest;
import com.school.auth.application.service.AuthService;
import com.school.auth.infrastructure.security.AppPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    CurrentUserResponse me(@AuthenticationPrincipal AppPrincipal principal) {
        return new CurrentUserResponse(principal.userId(), principal.schoolId(), principal.email(), principal.roles());
    }

    @GetMapping("/health")
    Map<String, String> health() {
        return Map.of("status", "UP", "service", "auth-service");
    }
}

