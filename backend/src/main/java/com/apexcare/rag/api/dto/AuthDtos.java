package com.apexcare.rag.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public final class AuthDtos {
    private AuthDtos() {}

    public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password,
        String role
    ) {}

    public record RegisterRequest(
        @NotBlank @Size(max = 80) String firstName,
        @NotBlank @Size(max = 80) String lastName,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 12, max = 72) String password
    ) {}

    public record UserResponse(UUID id, String name, String email, String role) {}

    public record AuthResponse(String token, UserResponse user) {}
}
