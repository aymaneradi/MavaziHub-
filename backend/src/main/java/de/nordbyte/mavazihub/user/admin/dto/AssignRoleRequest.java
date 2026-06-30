package de.nordbyte.mavazihub.user.admin.dto;

import de.nordbyte.mavazihub.role.entity.RoleName;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AssignRoleRequest(
        @NotNull
        UUID userId,

        @NotNull
        RoleName role
) {
}
