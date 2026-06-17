package de.nordbyte.mavazihub.returns.dto;

import de.nordbyte.mavazihub.returns.entity.ReturnRequestStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record ReturnRequestSummaryResponse(
        UUID id,
        String returnNumber,
        UUID orderId,
        String orderNumber,
        ReturnRequestStatus status,
        String reason,
        LocalDateTime createdAt
) {
}
