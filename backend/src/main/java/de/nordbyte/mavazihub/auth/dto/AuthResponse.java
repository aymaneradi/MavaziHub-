package de.nordbyte.mavazihub.auth.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        Long expiresIn
) {
}
