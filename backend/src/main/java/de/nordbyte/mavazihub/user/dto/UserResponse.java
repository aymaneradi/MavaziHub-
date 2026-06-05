package de.nordbyte.mavazihub.user.dto;

import java.util.Set;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String firstname,
        String lastname,
        String email,
        String phoneNumber,
        Set<String> roles
) {
}
