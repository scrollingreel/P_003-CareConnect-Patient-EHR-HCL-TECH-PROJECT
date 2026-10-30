package com.apexcare.rag.security;

import com.apexcare.rag.api.ApiException;
import com.apexcare.rag.domain.AppUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final String secret;
    private final long expirationMinutes;

    public JwtService(
        @Value("${app.jwt.secret:}") String secret,
        @Value("${app.jwt.expiration-minutes:60}") long expirationMinutes
    ) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException("JWT_SECRET must be set to a random value of at least 32 characters.");
        }
        this.secret = secret;
        this.expirationMinutes = expirationMinutes;
    }

    public String issue(AppUser user) {
        Instant now = Instant.now();
        return Jwts.builder()
            .subject(user.getId().toString())
            .claim("role", user.getRole().name())
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plus(expirationMinutes, ChronoUnit.MINUTES)))
            .signWith(key())
            .compact();
    }

    public Claims parse(String token) {
        try {
            return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload();
        } catch (Exception exception) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Your session is invalid or has expired.");
        }
    }

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
