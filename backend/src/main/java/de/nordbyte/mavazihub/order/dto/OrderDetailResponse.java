package de.nordbyte.mavazihub.order.dto;

import de.nordbyte.mavazihub.order.entity.OrderStatus;
import de.nordbyte.mavazihub.order.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record OrderDetailResponse(
        UUID id,
        String orderNumber,
        OrderStatus status,
        PaymentStatus paymentStatus,
        String mockTransactionId,
        BigDecimal totalAmount,
        String recipientName,
        String street,
        String postalCode,
        String city,
        String country,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<OrderItemResponse> items
) {
}
