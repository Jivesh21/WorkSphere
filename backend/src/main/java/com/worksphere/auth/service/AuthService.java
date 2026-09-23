package com.worksphere.auth.service;

import com.worksphere.auth.dto.AuthResponse;
import com.worksphere.auth.dto.LoginRequest;
import com.worksphere.auth.dto.RegisterRequest;
import com.worksphere.common.exception.ConflictException;
import com.worksphere.common.exception.UnauthorizedException;
import com.worksphere.security.CustomUserDetails;
import com.worksphere.security.JwtService;
import com.worksphere.security.TokenRevocationStore;
import com.worksphere.user.dto.UserResponse;
import com.worksphere.user.entity.Role;
import com.worksphere.user.entity.User;
import com.worksphere.user.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenRevocationStore tokenRevocationStore;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            TokenRevocationStore tokenRevocationStore
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenRevocationStore = tokenRevocationStore;
    }

    public void logout(String token) {
        String tokenId = jwtService.extractTokenId(token);
        Instant expiresAt = jwtService.extractExpiration(token);
        tokenRevocationStore.revoke(tokenId, expiresAt);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email is already registered");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.DEVELOPER);
        user.setEnabled(true);

        User saved = userRepository.save(user);
        return toAuthResponse(saved);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }
        if (!user.isEnabled()) {
            throw new UnauthorizedException("Account is disabled");
        }

        return toAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse me(Authentication authentication) {
        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        return UserResponse.from(principal.getUser());
    }

    private AuthResponse toAuthResponse(User user) {
        return new AuthResponse(jwtService.generateToken(user), UserResponse.from(user));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
