package de.nordbyte.mavazihub.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Enthält die Eingabedaten zum Anlegen einer Kategorie.
 */
@Data
public class CreateCategoryRequest {

    @NotBlank(message = "Kategoriename ist Pflicht")
    @Size(max = 100, message = "Kategoriename darf maximal 100 Zeichen haben")
    private String name;

    @Size(max = 500, message = "Beschreibung darf maximal 500 Zeichen haben")
    private String description;
}