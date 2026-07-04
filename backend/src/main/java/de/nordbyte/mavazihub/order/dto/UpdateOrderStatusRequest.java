package de.nordbyte.mavazihub.order.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateOrderStatusRequest(
        @NotBlank
        String status
) {
}
