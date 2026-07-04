package de.nordbyte.mavazihub.returnrequest.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateReturnStatusRequest(
        @NotBlank
        String status
) {
}
