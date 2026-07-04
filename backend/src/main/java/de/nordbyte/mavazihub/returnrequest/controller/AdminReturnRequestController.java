package de.nordbyte.mavazihub.returnrequest.controller;

import de.nordbyte.mavazihub.returnrequest.dto.ReturnRequestResponseDTO;
import de.nordbyte.mavazihub.returnrequest.dto.UpdateReturnStatusRequest;
import de.nordbyte.mavazihub.returnrequest.service.ReturnRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/returns")
@RequiredArgsConstructor
public class AdminReturnRequestController {

    private final ReturnRequestService returnRequestService;

    @GetMapping
    public ResponseEntity<List<ReturnRequestResponseDTO>> getReturns() {
        return ResponseEntity.ok(returnRequestService.getAllReturns());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReturnRequestResponseDTO> getReturn(@PathVariable UUID id) {
        return returnRequestService.getReturnById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ReturnRequestResponseDTO> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateReturnStatusRequest request
    ) {
        return ResponseEntity.ok(returnRequestService.updateStatus(id, request.status()));
    }
}
