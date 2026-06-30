package de.nordbyte.mavazihub.product.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Enthält die Ausgabedaten einer Produktvariante.
 */
@Data
@AllArgsConstructor
public class ProductVariantResponse {

    private Long id;
    private Long productId;
    private String size;
    private String color;
    private String pattern;
    private int stockQuantity;
    private boolean active;
    private String variantLabel;
}