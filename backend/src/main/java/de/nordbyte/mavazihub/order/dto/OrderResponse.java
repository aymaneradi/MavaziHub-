package de.nordbyte.mavazihub.order.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class OrderResponse {

    private UUID id;
    private String status;
    private String paymentStatus;
    private BigDecimal totalPrice;
    private LocalDateTime orderDate;
    private List<ItemDto> items;
    @Getter
    @Setter
    public static class ItemDto {
        private UUID id;
        private UUID productId;
        private String productName;
        private BigDecimal unitPrice;
        private Integer quantity;
    }
}
