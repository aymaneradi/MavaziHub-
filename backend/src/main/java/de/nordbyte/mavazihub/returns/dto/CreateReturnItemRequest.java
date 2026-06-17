package de.nordbyte.mavazihub.returns.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateReturnItemRequest(
        @NotNull
        UUID orderItemId,

        @Min(1)
        int quantity,

        String reason
) {
}
