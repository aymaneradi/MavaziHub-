package de.nordbyte.mavazihub.product.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Enthält die Eingabedaten zum Bearbeiten einer Produktvariante.
 */
@Data
public class UpdateProductVariantRequest {

    @Size(max = 50, message = "Größe darf maximal 50 Zeichen haben")
    private String size;

    @Size(max = 80, message = "Farbe darf maximal 80 Zeichen haben")
    private String color;

    @Size(max = 100, message = "Muster darf maximal 100 Zeichen haben")
    private String pattern;
}