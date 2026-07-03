package de.nordbyte.mavazihub.cart.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class CartItemRequest {

    private UUID customerId;
    private UUID productId;
    private String productName;
    private BigDecimal unitPrice;
    private Integer quantity;
}