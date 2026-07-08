package com.school.auth.application.service;

import com.school.auth.application.dto.LoginRequest;
import com.school.auth.domain.model.Role;
import com.school.auth.domain.model.RoleName;
import com.school.auth.domain.model.School;
import com.school.auth.domain.model.User;
import com.school.auth.domain.model.UserStatus;
import com.school.auth.domain.repository.UserRepository;
import com.school.auth.infrastructure.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    @Test
    void loginRejectsWrongPassword() {
        UserRepository userRepository = mock(UserRepository.class);
        School school = new School(UUID.randomUUID(), "Demo", "DEMO", Instant.now());
        Role role = new Role(UUID.randomUUID(), RoleName.ADMIN);
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        User user = new User(UUID.randomUUID(), school, "Demo Admin", "admin@demo.school", encoder.encode("correct-password"), UserStatus.ACTIVE, Set.of(role), Instant.now());
        when(userRepository.findBySchool_CodeIgnoreCaseAndEmailIgnoreCase("DEMO", "admin@demo.school")).thenReturn(Optional.of(user));

        AuthService service = new AuthService(
                userRepository,
                mock(com.school.auth.domain.repository.SchoolRepository.class),
                mock(com.school.auth.domain.repository.RoleRepository.class),
                mock(com.school.auth.domain.repository.AuditLogRepository.class),
                encoder,
                mock(JwtService.class),
                mock(com.school.auth.application.mapper.UserMapper.class)
        );

        assertThrows(BadCredentialsException.class, () -> service.login(new LoginRequest("DEMO", "admin@demo.school", "wrong-password")));
    }
}

