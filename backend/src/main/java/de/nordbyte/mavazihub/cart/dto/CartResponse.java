package de.nordbyte.mavazihub.cart.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class CartResponse {

    private UUID customerId;
    private List<CartItemDto> items;
    private BigDecimal totalPrice;

    @Getter
    @Setter
    public static class CartItemDto {
        private UUID id;
        private UUID productId;
        private String productName;
        private BigDecimal unitPrice;
        private Integer quantity;
        private BigDecimal subtotal;
    }
}