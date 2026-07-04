package de.nordbyte.mavazihub.order.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponse(
        UUID id,
        Long productId,
        String productName,
        BigDecimal unitPrice,
        Integer quantity,
        int returnableQuantity
) {
}
