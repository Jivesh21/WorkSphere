package com.worksphere.security;

import com.worksphere.user.entity.Role;
import com.worksphere.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        JwtProperties properties = new JwtProperties();
        properties.setSecret("test-secret-must-be-at-least-thirty-two-characters-long");
        properties.setExpirationMs(3_600_000L);
        jwtService = new JwtService(properties);
    }

    @Test
    void generateTokenContainsUserIdAndIsValid() {
        User user = sampleUser();

        String token = jwtService.generateToken(user);

        assertThat(token).isNotBlank();
        assertThat(jwtService.isValid(token)).isTrue();
        assertThat(jwtService.extractUserId(token)).isEqualTo(42L);
        assertThat(jwtService.extractTokenId(token)).isNotBlank();
        assertThat(jwtService.extractExpiration(token)).isAfter(java.time.Instant.now());
    }

    @Test
    void eachGeneratedTokenHasUniqueJti() {
        User user = sampleUser();

        String token1 = jwtService.generateToken(user);
        String token2 = jwtService.generateToken(user);

        assertThat(token1).isNotEqualTo(token2);
        assertThat(jwtService.extractTokenId(token1)).isNotEqualTo(jwtService.extractTokenId(token2));
    }

    @Test
    void tokenWithoutJtiIsInvalid() {
        // Build valid HMAC token without JTI claim
        java.time.Instant now = java.time.Instant.now();
        javax.crypto.SecretKey key = io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                "test-secret-must-be-at-least-thirty-two-characters-long".getBytes(java.nio.charset.StandardCharsets.UTF_8));
        String tokenWithoutJti = io.jsonwebtoken.Jwts.builder()
                .subject("42")
                .issuedAt(java.util.Date.from(now))
                .expiration(java.util.Date.from(now.plusSeconds(3600)))
                .signWith(key)
                .compact();

        assertThat(jwtService.isValid(tokenWithoutJti)).isFalse();
        org.junit.jupiter.api.Assertions.assertThrows(io.jsonwebtoken.JwtException.class, () ->
                jwtService.extractTokenId(tokenWithoutJti));
    }

    @Test
    void expiredTokenIsInvalid() {
        String token = jwtService.generateToken(sampleUser(), -1_000L);

        assertThat(jwtService.isValid(token)).isFalse();
    }

    @Test
    void tamperedTokenIsInvalid() {
        String token = jwtService.generateToken(sampleUser());

        assertThat(jwtService.isValid(token + "tamper")).isFalse();
    }

    @Test
    void tokenSignedWithDifferentSecretIsInvalid() {
        String token = jwtService.generateToken(sampleUser());

        JwtProperties otherProperties = new JwtProperties();
        otherProperties.setSecret("another-secret-must-be-at-least-thirty-two-chars");
        JwtService otherService = new JwtService(otherProperties);

        assertThat(otherService.isValid(token)).isFalse();
    }

    private User sampleUser() {
        User user = new User();
        user.setId(42L);
        user.setName("Ada");
        user.setEmail("ada@example.com");
        user.setRole(Role.DEVELOPER);
        user.setEnabled(true);
        return user;
    }
}
