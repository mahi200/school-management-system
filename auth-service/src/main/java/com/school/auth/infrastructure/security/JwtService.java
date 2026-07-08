package com.school.auth.infrastructure.security;

import com.school.auth.domain.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class JwtService {
    private final JwtProperties properties;
    private final SecretKey key;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        this.key = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
    }

    public TokenPair issue(User user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(properties.accessTokenMinutes() * 60);
        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toUnmodifiableSet());

        String token = Jwts.builder()
                .issuer(properties.issuer())
                .subject(user.getId().toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .claim("schoolId", user.getSchool().getId().toString())
                .claim("email", user.getEmail())
                .claim("roles", roles)
                .signWith(key)
                .compact();

        return new TokenPair(token, expiresAt);
    }

    @SuppressWarnings("unchecked")
    public AppPrincipal parse(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .requireIssuer(properties.issuer())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        Set<String> roles = Set.copyOf((java.util.List<String>) claims.get("roles", java.util.List.class));
        return new AppPrincipal(
                UUID.fromString(claims.getSubject()),
                UUID.fromString(claims.get("schoolId", String.class)),
                claims.get("email", String.class),
                roles
        );
    }

    public record TokenPair(String value, Instant expiresAt) {
    }
}

