package de.nordbyte.mavazihub.product.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * Enthält die Ausgabedaten eines Produkts für Übersichten.
 */
@Data
@AllArgsConstructor
public class ProductResponse {

    private Long id;
    private String name;
    private BigDecimal price;
    private String imageUrl;
    private List<String> imageUrls;
    private int stockQuantity;
    private Long categoryId;
    private String categoryName;
    private boolean active;
}
