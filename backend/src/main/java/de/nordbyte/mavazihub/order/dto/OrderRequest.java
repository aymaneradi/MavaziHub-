package de.nordbyte.mavazihub.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderRequest {
    @NotBlank(message = "Straße ist Pflicht")
    private String street;

    @NotBlank(message = "Postleitzahl ist Pflicht")
    private String zipCode;

    @NotBlank(message = "Ort ist Pflicht")
    private String city;
}
