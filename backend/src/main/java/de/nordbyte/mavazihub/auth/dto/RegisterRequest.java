package de.nordbyte.mavazihub.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.format.annotation.NumberFormat;

public record RegisterRequest(
        @NotBlank
        String firstname,

        @NotBlank
        String lastname,

        @NotBlank
        String phonenumber,

        @Email
        @NotBlank
        String email,

        @NotBlank
        String password
) {
}
