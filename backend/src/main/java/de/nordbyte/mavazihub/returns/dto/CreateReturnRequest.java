package de.nordbyte.mavazihub.returns.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CreateReturnRequest(
        String reason,

        @NotEmpty
        List<@Valid CreateReturnItemRequest> items
) {
}
