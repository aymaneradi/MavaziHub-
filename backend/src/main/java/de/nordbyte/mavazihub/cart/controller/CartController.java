package de.nordbyte.mavazihub.cart.controller;

import de.nordbyte.mavazihub.auth.security.model.CustomerUserDetails;
import de.nordbyte.mavazihub.cart.dto.CartItemRequest;
import de.nordbyte.mavazihub.cart.dto.CartResponse;
import de.nordbyte.mavazihub.cart.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    /**
     * GET /api/cart
     * Warenkorb eines Kunden anzeigen.
     */
    @GetMapping
    public ResponseEntity<CartResponse> getCart(Authentication authentication) {
        UUID customerId = currentCustomerId(authentication);
        CartResponse response = cartService.getCart(customerId);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/cart/items
     * Produkt in den Warenkorb legen.
     */
    @PostMapping("/items")
    public ResponseEntity<CartResponse> addToCart(
            @Valid @RequestBody CartItemRequest request,
            Authentication authentication
    ) {
        CartResponse response = cartService.addToCart(currentCustomerId(authentication), request);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/cart/items/{itemId}
     * Menge eines Artikels aktualisieren.
     * quantity=0 → Artikel wird entfernt.
     */
    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateQuantity(
            @PathVariable UUID itemId,
            @RequestParam Integer quantity,
            Authentication authentication) {
        CartResponse response = cartService.updateQuantity(currentCustomerId(authentication), itemId, quantity);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/cart/items/{itemId}
     * Einzelnen Artikel aus dem Warenkorb entfernen.
     */
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeItem(
            @PathVariable UUID itemId,
            Authentication authentication
    ) {
        CartResponse response = cartService.removeItem(currentCustomerId(authentication), itemId);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/cart
     * Gesamten Warenkorb leeren.
     */
    @DeleteMapping
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        cartService.clearCart(currentCustomerId(authentication));
        return ResponseEntity.noContent().build();
    }

    private UUID currentCustomerId(Authentication authentication) {
        CustomerUserDetails userDetails = (CustomerUserDetails) authentication.getPrincipal();
        return userDetails.getUser().getId();
    }
}
