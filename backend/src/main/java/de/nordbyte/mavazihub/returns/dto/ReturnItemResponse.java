package de.nordbyte.mavazihub.returns.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ReturnItemResponse(
        UUID id,
        UUID orderItemId,
        String productName,
        String variantSize,
        String variantColor,
        BigDecimal unitPrice,
        int quantity,
        String reason
) {
}
