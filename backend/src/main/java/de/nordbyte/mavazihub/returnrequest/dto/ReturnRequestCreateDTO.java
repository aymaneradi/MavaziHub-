package de.nordbyte.mavazihub.returnrequest.dto;

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

    private UUID orderId;
    private String reason;
    private List<ReturnItemDTO> items;

    @Getter
    @Setter
    public static class ReturnItemDTO {
        private UUID orderItemId;
        private Integer quantity;
    }
}
