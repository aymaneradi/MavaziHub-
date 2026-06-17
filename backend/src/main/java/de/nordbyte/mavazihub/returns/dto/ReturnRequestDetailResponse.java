package de.nordbyte.mavazihub.returns.dto;

import de.nordbyte.mavazihub.returns.entity.ReturnRequestStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ReturnRequestDetailResponse(
        UUID id,
        String returnNumber,
        UUID orderId,
        String orderNumber,
        ReturnRequestStatus status,
        String reason,
        String staffComment,
        LocalDateTime processedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<ReturnItemResponse> items
) {
}
