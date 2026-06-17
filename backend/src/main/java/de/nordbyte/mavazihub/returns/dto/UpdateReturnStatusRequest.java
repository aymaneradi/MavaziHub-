package de.nordbyte.mavazihub.returns.dto;

import de.nordbyte.mavazihub.returns.entity.ReturnRequestStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateReturnStatusRequest(
        @NotNull
        ReturnRequestStatus status,

        String staffComment
) {
}
