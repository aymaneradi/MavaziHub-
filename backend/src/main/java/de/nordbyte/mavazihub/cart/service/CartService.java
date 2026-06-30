package de.nordbyte.mavazihub.cart.service;

import de.nordbyte.mavazihub.cart.dto.CartItemRequest;
import de.nordbyte.mavazihub.cart.dto.CartResponse;
import de.nordbyte.mavazihub.cart.entity.CartItem;
import de.nordbyte.mavazihub.cart.repository.CartItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;

    /**
     * Produkt in den Warenkorb legen.
     * Wenn das Produkt bereits im Warenkorb ist → Menge erhöhen.
     */
    @Transactional
    public CartResponse addToCart(CartItemRequest request) {
        List<CartItem> existing = cartItemRepository.findByCustomerId(request.getCustomerId());

        CartItem cartItem = existing.stream()
                .filter(i -> i.getProductId().equals(request.getProductId()))
                .findFirst()
                .orElse(null);

        if (cartItem != null) {
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
            cartItemRepository.save(cartItem);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCustomerId(request.getCustomerId());
            newItem.setProductId(request.getProductId());
            newItem.setProductName(request.getProductName());
            newItem.setUnitPrice(request.getUnitPrice());
            newItem.setQuantity(request.getQuantity());
            cartItemRepository.save(newItem);
        }

        return getCart(request.getCustomerId());
    }

    /**
     * Warenkorb anzeigen mit Zwischensumme.
     */
    public CartResponse getCart(UUID customerId) {
        List<CartItem> items = cartItemRepository.findByCustomerId(customerId);

        List<CartResponse.CartItemDto> itemDtos = items.stream().map(item -> {
            CartResponse.CartItemDto dto = new CartResponse.CartItemDto();
            dto.setId(item.getId());
            dto.setProductId(item.getProductId());
            dto.setProductName(item.getProductName());
            dto.setUnitPrice(item.getUnitPrice());
            dto.setQuantity(item.getQuantity());
            dto.setSubtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            return dto;
        }).toList();

        BigDecimal total = itemDtos.stream()
                .map(CartResponse.CartItemDto::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CartResponse response = new CartResponse();
        response.setCustomerId(customerId);
        response.setItems(itemDtos);
        response.setTotalPrice(total);
        return response;
    }

    /**
     * Menge eines Artikels aktualisieren.
     * quantity <= 0 → Artikel entfernen.
     */
    @Transactional
    public CartResponse updateQuantity(UUID cartItemId, Integer newQuantity) {
        CartItem item = cartItemRepository.findById( cartItemId)
                .orElseThrow(() -> new RuntimeException(
                        "CartItem mit ID " + cartItemId + " nicht gefunden."));

        if (newQuantity <= 0) {
            UUID customerId = item.getCustomerId();
            cartItemRepository.delete(item);
            return getCart(  customerId);
        }

        item.setQuantity(newQuantity);
        cartItemRepository.save(item);
        return getCart(item.getCustomerId());
    }

    /**
     * Einzelnen Artikel aus dem Warenkorb entfernen.
     */
    @Transactional
    public CartResponse removeItem(UUID cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException(
                        "CartItem mit ID " + cartItemId + " nicht gefunden."));

        UUID customerId = item.getCustomerId();
        cartItemRepository.delete(item);
        return getCart(customerId);
    }

    /**
     * NEU: Gesamten Warenkorb leeren (DELETE /api/cart).
     */
    @Transactional
    public void clearCart(UUID customerId) {
        cartItemRepository.deleteByCustomerId(customerId);
    }
}
