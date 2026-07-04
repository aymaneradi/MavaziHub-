package de.nordbyte.mavazihub.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UpdateUserRequest(
        @NotBlank
        String firstname,

        @NotBlank
        String lastname,

        @Email
        @NotBlank
        String email,

        @NotBlank
        String phoneNumber
) {
}
