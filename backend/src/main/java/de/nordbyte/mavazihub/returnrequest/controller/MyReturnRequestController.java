package de.nordbyte.mavazihub.returnrequest.controller;

import de.nordbyte.mavazihub.auth.security.model.CustomerUserDetails;
import de.nordbyte.mavazihub.returnrequest.dto.ReturnRequestCreateDTO;
import de.nordbyte.mavazihub.returnrequest.dto.ReturnRequestResponseDTO;
import de.nordbyte.mavazihub.returnrequest.service.ReturnRequestService;
import de.nordbyte.mavazihub.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class MyReturnRequestController {

    private final ReturnRequestService returnRequestService;

    @PostMapping("/api/me/orders/{orderId}/returns")
    public ResponseEntity<ReturnRequestResponseDTO> requestReturnForMyOrder(
            @PathVariable UUID orderId,
            @RequestBody ReturnRequestCreateDTO request,
            Authentication authentication
    ) {
        request.setOrderId(orderId);
        ReturnRequestResponseDTO response = returnRequestService.requestReturn(
                currentUser(authentication).getId(),
                request
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/me/returns")
    public ResponseEntity<List<ReturnRequestResponseDTO>> getMyReturns(Authentication authentication) {
        return ResponseEntity.ok(returnRequestService.getMyReturns(currentUser(authentication).getId()));
    }

    @GetMapping("/api/me/returns/{returnId}")
    public ResponseEntity<ReturnRequestResponseDTO> getMyReturn(
            @PathVariable UUID returnId,
            Authentication authentication
    ) {
        return returnRequestService.getReturnById(returnId, currentUser(authentication).getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private User currentUser(Authentication authentication) {
        CustomerUserDetails userDetails = (CustomerUserDetails) authentication.getPrincipal();
        return userDetails.getUser();
    }
}
