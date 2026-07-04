package de.nordbyte.mavazihub.user.admin.dto;

import de.nordbyte.mavazihub.role.entity.RoleName;
import jakarta.validation.constraints.NotEmpty;

import java.util.Set;

public record UpdateUserRolesRequest(
        @NotEmpty
        Set<RoleName> roles
) {
}
