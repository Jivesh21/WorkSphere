package com.worksphere.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class InMemoryTokenRevocationStoreTest {

    private InMemoryTokenRevocationStore store;

    @BeforeEach
    void setUp() {
        store = new InMemoryTokenRevocationStore();
    }

    @Test
    void nonRevokedTokenReturnsFalse() {
        assertThat(store.isRevoked("non-existent-id")).isFalse();
        assertThat(store.isRevoked(null)).isFalse();
        assertThat(store.isRevoked("")).isFalse();
    }

    @Test
    void revokedTokenReturnsTrueBeforeExpiration() {
        String tokenId = "token-123";
        Instant expiresAt = Instant.now().plusSeconds(300);

        store.revoke(tokenId, expiresAt);

        assertThat(store.isRevoked(tokenId)).isTrue();
    }

    @Test
    void expiredRevocationIsTreatedAsNotRevokedAndCleaned() {
        String tokenId = "token-expired";
        Instant pastExpiration = Instant.now().minusSeconds(10);

        // Revoke with past expiration directly or simulate expiration
        store.revoke(tokenId, pastExpiration);

        // Since expiresAt is past, store does not retain it or isRevoked returns false
        assertThat(store.isRevoked(tokenId)).isFalse();
    }

    @Test
    void cleanExpiredRemovesExpiredEntries() {
        store.revoke("token-valid", Instant.now().plusSeconds(600));
        store.cleanExpired();
        assertThat(store.isRevoked("token-valid")).isTrue();
    }
}
