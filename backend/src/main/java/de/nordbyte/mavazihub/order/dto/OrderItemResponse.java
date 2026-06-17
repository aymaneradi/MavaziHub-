package de.nordbyte.mavazihub.order.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponse(
        UUID id,
        UUID productId,
        String productName,
        String variantSize,
        String variantColor,
        BigDecimal unitPrice,
        int quantity,
        int returnableQuantity
) {
}
