package de.nordbyte.mavazihub.order.controller;

import de.nordbyte.mavazihub.order.dto.OrderResponse;
import de.nordbyte.mavazihub.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Admin-Endpoints für Bestellverwaltung.
 * Zugriff nur für ROLE_ADMIN (gesichert via SecurityConfig).
 */
@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:8080")
public class AdminOrderController {

    private final OrderService orderService;

    /**
     * GET /api/admin/orders
     * Alle Bestellungen abrufen (Admin-Übersicht).
     */
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<OrderResponse> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    /**
     * GET /api/admin/orders/{id}
     * Einzelne Bestellung abrufen (Admin-Detailansicht).
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable UUID id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * PATCH /api/admin/orders/{id}/status
     * Bestellstatus aktualisieren.
     *
     * Request Body: { "status": "SHIPPED" }
     * Mögliche Status: PROCESSING, PAID, SHIPPED, DELIVERED, CANCELLED
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {

        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        return orderService.updateOrderStatus(id, newStatus)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
