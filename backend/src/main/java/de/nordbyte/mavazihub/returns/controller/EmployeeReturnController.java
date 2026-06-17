package de.nordbyte.mavazihub.returns.controller;

import de.nordbyte.mavazihub.auth.security.model.CustomerUserDetails;
import de.nordbyte.mavazihub.returns.dto.ReturnRequestDetailResponse;
import de.nordbyte.mavazihub.returns.dto.ReturnRequestSummaryResponse;
import de.nordbyte.mavazihub.returns.dto.UpdateReturnStatusRequest;
import de.nordbyte.mavazihub.returns.service.ReturnRequestService;
import de.nordbyte.mavazihub.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/employee/returns")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
public class EmployeeReturnController {
    private final ReturnRequestService returnRequestService;

    @GetMapping
    public ResponseEntity<List<ReturnRequestSummaryResponse>> getReturns() {
        return ResponseEntity.ok(returnRequestService.getAllReturns());
    }

    @GetMapping("/{returnId}")
    public ResponseEntity<ReturnRequestDetailResponse> getReturn(@PathVariable UUID returnId) {
        return ResponseEntity.ok(returnRequestService.getReturn(returnId));
    }

    @PatchMapping("/{returnId}/status")
    public ResponseEntity<ReturnRequestDetailResponse> updateReturnStatus(
            @PathVariable UUID returnId,
            @Valid @RequestBody UpdateReturnStatusRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(returnRequestService.updateReturnStatus(
                returnId,
                currentUser(authentication),
                request
        ));
    }

    private User currentUser(Authentication authentication) {
        CustomerUserDetails userDetails = (CustomerUserDetails) authentication.getPrincipal();
        return userDetails.getUser();
    }
}
