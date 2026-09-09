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
