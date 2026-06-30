package de.nordbyte.mavazihub.order.controller;

import de.nordbyte.mavazihub.auth.security.model.CustomerUserDetails;
import de.nordbyte.mavazihub.order.dto.OrderDetailResponse;
import de.nordbyte.mavazihub.order.dto.OrderItemResponse;
import de.nordbyte.mavazihub.order.dto.OrderSummaryResponse;
import de.nordbyte.mavazihub.order.service.OrderHistoryService;
import de.nordbyte.mavazihub.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/me/orders")
@RequiredArgsConstructor
public class OrderHistoryController {
    private final OrderHistoryService orderHistoryService;

    @GetMapping
    public ResponseEntity<List<OrderSummaryResponse>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(orderHistoryService.getOrderHistory(currentUser(authentication)));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDetailResponse> getMyOrder(
            @PathVariable UUID orderId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(orderHistoryService.getOrderDetails(orderId, currentUser(authentication)));
    }

    @GetMapping("/{orderId}/returnable-items")
    public ResponseEntity<List<OrderItemResponse>> getReturnableItems(
            @PathVariable UUID orderId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(orderHistoryService.getReturnableItems(orderId, currentUser(authentication)));
    }

    private User currentUser(Authentication authentication) {
        CustomerUserDetails userDetails = (CustomerUserDetails) authentication.getPrincipal();
        return userDetails.getUser();
    }
}
