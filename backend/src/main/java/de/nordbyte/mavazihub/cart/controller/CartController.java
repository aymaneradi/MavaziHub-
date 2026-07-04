package de.nordbyte.mavazihub.cart.controller;

import de.nordbyte.mavazihub.auth.security.model.CustomerUserDetails;
import de.nordbyte.mavazihub.cart.dto.CartItemRequest;
import de.nordbyte.mavazihub.cart.dto.CartResponse;
import de.nordbyte.mavazihub.cart.service.CartService;
import de.nordbyte.mavazihub.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:8080")
public class CartController {

    private final CartService cartService;

    /**
     * GET /api/cart
     * Warenkorb eines Kunden anzeigen.
     * Übergangsweise mit @RequestParam (bis JWT-Integration abgeschlossen).
     */
    @GetMapping
    public ResponseEntity<CartResponse> getCart(@RequestParam UUID customerId) {
        CartResponse response = cartService.getCart(customerId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<CartResponse> getMyCart(Authentication authentication) {
        CartResponse response = cartService.getCart(currentUser(authentication).getId());
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/cart/items
     * Produkt in den Warenkorb legen.
     */
    @PostMapping("/items")
    public ResponseEntity<CartResponse> addToCart(@RequestBody CartItemRequest request) {
        CartResponse response = cartService.addToCart(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/me/items")
    public ResponseEntity<CartResponse> addToMyCart(
            @RequestBody CartItemRequest request,
            Authentication authentication
    ) {
        request.setCustomerId(currentUser(authentication).getId());
        CartResponse response = cartService.addToCart(request);
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
            @RequestParam Integer quantity) {
        CartResponse response = cartService.updateQuantity(itemId, quantity);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/cart/items/{itemId}
     * Einzelnen Artikel aus dem Warenkorb entfernen.
     */
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeItem(@PathVariable UUID itemId) {
        CartResponse response = cartService.removeItem(itemId);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/cart
     * Gesamten Warenkorb leeren.
     */
    @DeleteMapping
    public ResponseEntity<Void> clearCart(@RequestParam UUID customerId) {
        cartService.clearCart(customerId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> clearMyCart(Authentication authentication) {
        cartService.clearCart(currentUser(authentication).getId());
        return ResponseEntity.noContent().build();
    }

    private User currentUser(Authentication authentication) {
        CustomerUserDetails userDetails = (CustomerUserDetails) authentication.getPrincipal();
        return userDetails.getUser();
    }
}
