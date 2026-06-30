package de.nordbyte.mavazihub.product.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Enthält die Ausgabedaten einer Kategorie.
 */
@Data
@AllArgsConstructor
public class CategoryResponse {

    private Long id;
    private String name;
    private String description;
}