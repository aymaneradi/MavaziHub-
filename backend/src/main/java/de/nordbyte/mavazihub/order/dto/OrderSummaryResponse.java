package de.nordbyte.mavazihub.order.dto;

import de.nordbyte.mavazihub.order.entity.OrderStatus;
import de.nordbyte.mavazihub.order.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record OrderSummaryResponse(
        UUID id,
        String orderNumber,
        OrderStatus status,
        PaymentStatus paymentStatus,
        BigDecimal totalAmount,
        LocalDateTime createdAt
) {
}
