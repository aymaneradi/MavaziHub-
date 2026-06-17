package de.nordbyte.mavazihub.returns.controller;

import de.nordbyte.mavazihub.auth.security.model.CustomerUserDetails;
import de.nordbyte.mavazihub.returns.dto.CreateReturnRequest;
import de.nordbyte.mavazihub.returns.dto.ReturnRequestDetailResponse;
import de.nordbyte.mavazihub.returns.dto.ReturnRequestSummaryResponse;
import de.nordbyte.mavazihub.returns.service.ReturnRequestService;
import de.nordbyte.mavazihub.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class CustomerReturnController {
    private final ReturnRequestService returnRequestService;

    @PostMapping("/api/me/orders/{orderId}/returns")
    public ResponseEntity<ReturnRequestDetailResponse> createReturnRequest(
            @PathVariable UUID orderId,
            @Valid @RequestBody CreateReturnRequest request,
            Authentication authentication
    ) {
        ReturnRequestDetailResponse response = returnRequestService.createReturnRequest(
                orderId,
                currentUser(authentication),
                request
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/me/returns")
    public ResponseEntity<List<ReturnRequestSummaryResponse>> getMyReturns(Authentication authentication) {
        return ResponseEntity.ok(returnRequestService.getMyReturns(currentUser(authentication)));
    }

    @GetMapping("/api/me/returns/{returnId}")
    public ResponseEntity<ReturnRequestDetailResponse> getMyReturn(
            @PathVariable UUID returnId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(returnRequestService.getMyReturn(returnId, currentUser(authentication)));
    }

    private User currentUser(Authentication authentication) {
        CustomerUserDetails userDetails = (CustomerUserDetails) authentication.getPrincipal();
        return userDetails.getUser();
    }
}
