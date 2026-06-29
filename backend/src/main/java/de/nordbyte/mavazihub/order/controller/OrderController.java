package de.nordbyte.mavazihub.order.controller;

import de.nordbyte.mavazihub.order.dto.OrderRequest;
import de.nordbyte.mavazihub.order.dto.OrderResponse;
import de.nordbyte.mavazihub.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import de.nordbyte.mavazihub.user.entity.User;
import java.util.List;
import java.util.UUID;


@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    private final OrderService orderService;

    /**
     * GET /api/orders/my
     *
     */
    @GetMapping("/api/orders/my")
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            @RequestParam UUID customerId) {
        List<OrderResponse> orders = orderService.getMyOrders(customerId);
        return ResponseEntity.ok(orders);
    }

    /**
     * GET /api/orders/{id}
     */
    @GetMapping("/api/orders/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable UUID id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/cart/checkout
     */
    @PostMapping("/api/cart/checkout")
    public ResponseEntity<OrderResponse> checkout(@RequestBody OrderRequest request) {
        OrderResponse response = orderService.processOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
