package com.school.auth.application.service;

import com.school.auth.application.dto.AuthResponse;
import com.school.auth.application.dto.LoginRequest;
import com.school.auth.application.dto.RegisterRequest;
import com.school.auth.application.mapper.UserMapper;
import com.school.auth.domain.model.AuditLog;
import com.school.auth.domain.model.Role;
import com.school.auth.domain.model.School;
import com.school.auth.domain.model.User;
import com.school.auth.domain.model.UserStatus;
import com.school.auth.domain.repository.AuditLogRepository;
import com.school.auth.domain.repository.RoleRepository;
import com.school.auth.domain.repository.SchoolRepository;
import com.school.auth.domain.repository.UserRepository;
import com.school.auth.infrastructure.security.JwtService;
import com.school.auth.infrastructure.web.ConflictException;
import com.school.auth.infrastructure.web.NotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final RoleRepository roleRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    public AuthService(
            UserRepository userRepository,
            SchoolRepository schoolRepository,
            RoleRepository roleRepository,
            AuditLogRepository auditLogRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            UserMapper userMapper
    ) {
        this.userRepository = userRepository;
        this.schoolRepository = schoolRepository;
        this.roleRepository = roleRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userMapper = userMapper;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        School school = schoolRepository.findByCodeIgnoreCase(request.schoolCode())
                .orElseThrow(() -> new NotFoundException("School not found"));

        if (userRepository.existsBySchool_CodeIgnoreCaseAndEmailIgnoreCase(request.schoolCode(), request.email())) {
            throw new ConflictException("Email already exists for this school");
        }

        Set<Role> roles = request.roles().stream()
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new NotFoundException("Role not found: " + roleName)))
                .collect(Collectors.toUnmodifiableSet());

        Instant now = Instant.now();
        User user = new User(
                UUID.randomUUID(),
                school,
                request.fullName().trim(),
                request.email().trim().toLowerCase(),
                passwordEncoder.encode(request.password()),
                UserStatus.ACTIVE,
                roles,
                now
        );

        User saved = userRepository.save(user);
        auditLogRepository.save(new AuditLog(UUID.randomUUID(), school.getId(), saved.getId(), "USER_REGISTERED", "users", saved.getId(), now));
        JwtService.TokenPair token = jwtService.issue(saved);
        return new AuthResponse(token.value(), "Bearer", token.expiresAt(), userMapper.toResponse(saved));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findBySchool_CodeIgnoreCaseAndEmailIgnoreCase(request.schoolCode(), request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (user.getStatus() != UserStatus.ACTIVE || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        JwtService.TokenPair token = jwtService.issue(user);
        return new AuthResponse(token.value(), "Bearer", token.expiresAt(), userMapper.toResponse(user));
    }
}

