package de.nordbyte.mavazihub.product.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Enthält die Ausgabedaten eines Produkts für Detailansichten.
 */
@Data
@AllArgsConstructor
public class ProductDetailResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private int stockQuantity;
    private Long categoryId;
    private String categoryName;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}