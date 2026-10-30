package com.apexcare.rag.service;

import com.apexcare.rag.api.ApiException;
import com.apexcare.rag.api.dto.AuthDtos;
import com.apexcare.rag.domain.AppUser;
import com.apexcare.rag.domain.UserRole;
import com.apexcare.rag.repository.AppUserRepository;
import com.apexcare.rag.security.JwtService;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(AppUserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (users.findByEmailIgnoreCase(email).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }
        AppUser user = new AppUser(
            UUID.randomUUID(), request.firstName().trim() + " " + request.lastName().trim(), email,
            passwordEncoder.encode(request.password()), UserRole.PATIENT, Instant.now()
        );
        users.save(user);
        return response(user);
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        AppUser user = users.findByEmailIgnoreCase(normalizeEmail(request.email()))
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }
        if (request.role() != null && !request.role().isBlank()
            && !user.getRole().name().equalsIgnoreCase(request.role())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This account does not have the selected role.");
        }
        return response(user);
    }

    public AuthDtos.UserResponse userResponse(AppUser user) {
        return new AuthDtos.UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole().name().toLowerCase());
    }

    private AuthDtos.AuthResponse response(AppUser user) {
        return new AuthDtos.AuthResponse(jwtService.issue(user), userResponse(user));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
