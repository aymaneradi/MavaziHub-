package de.nordbyte.mavazihub.cart.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemRequest {

    @NotNull(message = "Produkt-ID ist Pflicht")
    private Long productId;

    private Long variantId;

    @NotNull(message = "Menge ist Pflicht")
    @Positive(message = "Menge muss größer als 0 sein")
    private Integer quantity;
}
