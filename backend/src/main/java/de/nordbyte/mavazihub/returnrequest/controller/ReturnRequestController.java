package de.nordbyte.mavazihub.returnrequest.controller;

import de.nordbyte.mavazihub.returnrequest.dto.ReturnRequestCreateDTO;
import de.nordbyte.mavazihub.returnrequest.dto.ReturnRequestResponseDTO;
import de.nordbyte.mavazihub.returnrequest.service.ReturnRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/returns")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:8080")
public class ReturnRequestController {

    private final ReturnRequestService returnRequestService;

    /**
     * POST /api/returns
     * Rücksendung anfordern (UC-RS-01).
     */
    @PostMapping
    public ResponseEntity<ReturnRequestResponseDTO> requestReturn(
            @RequestParam UUID customerId,
            @RequestBody ReturnRequestCreateDTO dto) {

        ReturnRequestResponseDTO response =
                returnRequestService.requestReturn(customerId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/returns/my
     * Eigene Rücksendeanfragen einsehen (QA-09).
     */
    @GetMapping("/my")
    public ResponseEntity<List<ReturnRequestResponseDTO>> getMyReturns(
            @RequestParam UUID customerId) {

        List<ReturnRequestResponseDTO> returns =
                returnRequestService.getMyReturns(customerId);
        return ResponseEntity.ok(returns);
    }

    /**
     * NEU: GET /api/returns/{id}
     * Eine einzelne Rücksendeanfrage abrufen.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReturnRequestResponseDTO> getReturnById(
            @PathVariable UUID id,
            @RequestParam UUID customerId) {

        return returnRequestService.getReturnById(id, customerId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
