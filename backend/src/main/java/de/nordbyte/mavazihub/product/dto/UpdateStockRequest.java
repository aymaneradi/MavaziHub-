package de.nordbyte.mavazihub.product.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

/**
 * Enthält die Eingabedaten zur Änderung des Lagerbestands.
 */
@Data
public class UpdateStockRequest {

    @NotNull(message = "Lagerbestand ist Pflicht")
    @PositiveOrZero(message = "Lagerbestand darf nicht negativ sein")
    private Integer stockQuantity;
}