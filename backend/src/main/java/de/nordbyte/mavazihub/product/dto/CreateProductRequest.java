package de.nordbyte.mavazihub.product.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Enthält die Eingabedaten zum Anlegen eines Produkts.
 */
@Data
public class CreateProductRequest {

    @NotBlank(message = "Produktname ist Pflicht")
    @Size(max = 150, message = "Produktname darf maximal 150 Zeichen haben")
    private String name;

    @Size(max = 5000, message = "Beschreibung darf maximal 5000 Zeichen haben")
    private String description;

    @NotNull(message = "Preis ist Pflicht")
    @DecimalMin(value = "0.01", message = "Preis muss größer als 0 sein")
    private BigDecimal price;

    @Size(max = 500, message = "Bild-URL darf maximal 500 Zeichen haben")
    private String imageUrl;

    @PositiveOrZero(message = "Lagerbestand darf nicht negativ sein")
    private int stockQuantity;

    @NotNull(message = "Kategorie ist Pflicht")
    private Long categoryId;
}