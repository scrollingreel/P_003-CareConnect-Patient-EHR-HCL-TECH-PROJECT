package com.apexcare.rag.config;

import com.apexcare.rag.domain.AppUser;
import com.apexcare.rag.domain.UserRole;
import com.apexcare.rag.repository.AppUserRepository;
import jakarta.annotation.PostConstruct;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class BootstrapAdmin {
    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;
    private final String name;

    public BootstrapAdmin(AppUserRepository users, PasswordEncoder passwordEncoder,
                          @Value("${app.bootstrap-admin.email:}") String email,
                          @Value("${app.bootstrap-admin.password:}") String password,
                          @Value("${app.bootstrap-admin.name:}") String name) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.password = password;
        this.name = name;
    }

    @PostConstruct
    void createConfiguredAdmin() {
        if (email.isBlank() || password.isBlank() || name.isBlank() || password.length() < 12) {
            return;
        }
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        if (users.findByEmailIgnoreCase(normalizedEmail).isEmpty()) {
            users.save(new AppUser(UUID.randomUUID(), name.trim(), normalizedEmail,
                passwordEncoder.encode(password), UserRole.ADMIN, Instant.now()));
        }
    }
}
