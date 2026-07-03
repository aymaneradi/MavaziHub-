package de.nordbyte.mavazihub.order.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record OrderSummaryResponse(
        UUID id,
        String status,
        String paymentStatus,
        BigDecimal totalPrice,
        LocalDateTime orderDate
) {
}
