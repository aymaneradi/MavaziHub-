package de.nordbyte.mavazihub.order.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record OrderDetailResponse(
        UUID id,
        UUID customerId,
        String status,
        String paymentStatus,
        BigDecimal totalPrice,
        String street,
        String zipCode,
        String city,
        LocalDateTime orderDate,
        List<OrderItemResponse> items
) {
}
