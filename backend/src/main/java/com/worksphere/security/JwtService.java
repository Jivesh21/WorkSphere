package com.worksphere.security;

import com.worksphere.user.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final JwtProperties jwtProperties;
    private final SecretKey signingKey;

    public JwtService(JwtProperties jwtProperties) {
        if (!StringUtils.hasText(jwtProperties.getSecret())) {
            throw new IllegalStateException("app.jwt.secret / JWT_SECRET must be configured");
        }
        this.jwtProperties = jwtProperties;
        this.signingKey = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(User user) {
        return generateToken(user, jwtProperties.getExpirationMs());
    }

    public String generateToken(User user, long expirationMs) {
        Instant now = Instant.now();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMs)))
                .signWith(signingKey)
                .compact();
    }

    public Long extractUserId(String token) {
        return Long.parseLong(parseClaims(token).getSubject());
    }

    public String extractTokenId(String token) {
        String jti = parseClaims(token).getId();
        if (!StringUtils.hasText(jti)) {
            throw new JwtException("Token missing JTI");
        }
        return jti;
    }

    public Instant extractExpiration(String token) {
        Date expiration = parseClaims(token).getExpiration();
        if (expiration == null) {
            throw new JwtException("Token missing expiration");
        }
        return expiration.toInstant();
    }

    public boolean isValid(String token) {
        try {
            Claims claims = parseClaims(token);
            return StringUtils.hasText(claims.getId());
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
