package de.nordbyte.mavazihub.returnrequest.controller;

import de.nordbyte.mavazihub.auth.security.model.CustomerUserDetails;
import de.nordbyte.mavazihub.returnrequest.dto.ReturnRequestCreateDTO;
import de.nordbyte.mavazihub.returnrequest.dto.ReturnRequestResponseDTO;
import de.nordbyte.mavazihub.returnrequest.service.ReturnRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/returns")
@RequiredArgsConstructor
public class ReturnRequestController {

    private final ReturnRequestService returnRequestService;

    /**
     * POST /api/returns
     * Rücksendung anfordern (UC-RS-01).
     */
    @PostMapping
    public ResponseEntity<ReturnRequestResponseDTO> requestReturn(
            @Valid @RequestBody ReturnRequestCreateDTO dto,
            Authentication authentication) {

        ReturnRequestResponseDTO response =
                returnRequestService.requestReturn(currentCustomerId(authentication), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/returns/my
     * Eigene Rücksendeanfragen einsehen (QA-09).
     */
    @GetMapping("/my")
    public ResponseEntity<List<ReturnRequestResponseDTO>> getMyReturns(
            Authentication authentication) {

        List<ReturnRequestResponseDTO> returns =
                returnRequestService.getMyReturns(currentCustomerId(authentication));
        return ResponseEntity.ok(returns);
    }

    /**
     * NEU: GET /api/returns/{id}
     * Eine einzelne Rücksendeanfrage abrufen.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReturnRequestResponseDTO> getReturnById(
            @PathVariable UUID id,
            Authentication authentication) {

        return returnRequestService.getReturnById(id, currentCustomerId(authentication))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private UUID currentCustomerId(Authentication authentication) {
        CustomerUserDetails userDetails = (CustomerUserDetails) authentication.getPrincipal();
        return userDetails.getUser().getId();
    }
}
