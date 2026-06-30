package de.nordbyte.mavazihub.user.admin.dto;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

public record AdminUserResponse(
        UUID id,
        String firtsname,
        String lastname,
        String email,
        String phoneNumber,
        boolean enabled,
        boolean accountLocked,
        Set<String> roles,
        LocalDateTime createdAt
) {
}
