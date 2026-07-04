package de.nordbyte.mavazihub.returnrequest.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import java.util.List;
import java.util.UUID;

/**
 * DTO für POST /api/returns
 * Wird vom Client gesendet, wenn ein Kunde eine Rücksendung anfordert.
 */
@Getter
@Setter
public class ReturnRequestCreateDTO {

    @NotNull(message = "Bestellung ist Pflicht")
    private UUID orderId;
    private String reason;

    @Valid
    @NotEmpty(message = "Mindestens ein Rücksendeartikel ist Pflicht")
    private List<ReturnItemDTO> items;

    @Getter
    @Setter
    public static class ReturnItemDTO {
        @NotNull(message = "Bestellartikel ist Pflicht")
        private UUID orderItemId;

        @NotNull(message = "Menge ist Pflicht")
        @Positive(message = "Menge muss größer als 0 sein")
        private Integer quantity;
    }
}
