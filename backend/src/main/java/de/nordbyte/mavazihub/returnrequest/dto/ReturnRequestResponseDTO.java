package de.nordbyte.mavazihub.returnrequest.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO für API-Antworten (GET /api/returns/my, POST /api/returns).
 */
@Getter
@Setter
public class ReturnRequestResponseDTO {

    private UUID id;
    private UUID orderId;
    private String reason;
    private String status;
    private LocalDateTime createdAt;
    private List<ReturnItemResponseDTO> items;

    @Getter
    @Setter
    public static class ReturnItemResponseDTO {
        private UUID orderItemId;
        private Integer quantity;
    }
}
