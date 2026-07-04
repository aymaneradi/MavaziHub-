package de.nordbyte.mavazihub.order.controller;

import de.nordbyte.mavazihub.auth.security.model.CustomerUserDetails;
import de.nordbyte.mavazihub.order.dto.OrderRequest;
import de.nordbyte.mavazihub.order.dto.OrderResponse;
import de.nordbyte.mavazihub.order.service.OrderService;
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
public class OrderController {

    private final OrderService orderService;

    /**
     * GET /api/orders/my
     *
     */
    @GetMapping("/api/orders/my")
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            Authentication authentication) {
        List<OrderResponse> orders = orderService.getMyOrders(currentCustomerId(authentication));
        return ResponseEntity.ok(orders);
    }

    /**
     * GET /api/orders/{id}
     */
    @GetMapping("/api/orders/{id}")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        return orderService.getOrderById(id, currentCustomerId(authentication))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/cart/checkout
     */
    @PostMapping("/api/cart/checkout")
    public ResponseEntity<OrderResponse> checkout(
            @Valid @RequestBody OrderRequest request,
            Authentication authentication
    ) {
        OrderResponse response = orderService.processOrder(currentCustomerId(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    private UUID currentCustomerId(Authentication authentication) {
        CustomerUserDetails userDetails = (CustomerUserDetails) authentication.getPrincipal();
        return userDetails.getUser().getId();
    }
}
