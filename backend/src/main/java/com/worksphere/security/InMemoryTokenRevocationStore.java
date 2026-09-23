package com.worksphere.security;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class InMemoryTokenRevocationStore implements TokenRevocationStore {

    private final Map<String, Instant> revokedTokens = new ConcurrentHashMap<>();

    @Override
    public void revoke(String tokenId, Instant expiresAt) {
        if (StringUtils.hasText(tokenId) && expiresAt != null && expiresAt.isAfter(Instant.now())) {
            revokedTokens.put(tokenId, expiresAt);
        }
    }

    @Override
    public boolean isRevoked(String tokenId) {
        if (!StringUtils.hasText(tokenId)) {
            return false;
        }
        Instant expiresAt = revokedTokens.get(tokenId);
        if (expiresAt == null) {
            return false;
        }
        if (Instant.now().isAfter(expiresAt)) {
            revokedTokens.remove(tokenId);
            return false;
        }
        return true;
    }

    public void cleanExpired() {
        Instant now = Instant.now();
        revokedTokens.entrySet().removeIf(entry -> entry.getValue() == null || now.isAfter(entry.getValue()));
    }
}
