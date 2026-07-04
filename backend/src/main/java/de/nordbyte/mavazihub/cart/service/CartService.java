package de.nordbyte.mavazihub.cart.service;

import de.nordbyte.mavazihub.cart.dto.CartItemRequest;
import de.nordbyte.mavazihub.cart.dto.CartResponse;
import de.nordbyte.mavazihub.cart.entity.CartItem;
import de.nordbyte.mavazihub.cart.repository.CartItemRepository;
import de.nordbyte.mavazihub.common.exception.BusinessException;
import de.nordbyte.mavazihub.common.exception.ResourceNotFoundException;
import de.nordbyte.mavazihub.product.entity.Product;
import de.nordbyte.mavazihub.product.entity.ProductVariant;
import de.nordbyte.mavazihub.product.service.ProductService;
import de.nordbyte.mavazihub.product.service.ProductVariantService;
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
    private final ProductService productService;
    private final ProductVariantService productVariantService;

    /**
     * Produkt in den Warenkorb legen.
     * Wenn das Produkt bereits im Warenkorb ist → Menge erhöhen.
     */
    @Transactional
    public CartResponse addToCart(UUID customerId, CartItemRequest request) {
        Product product = productService.getActiveProductEntityOrThrow(request.getProductId());
        ProductVariant variant = null;

        if (request.getVariantId() != null) {
            variant = productVariantService.getActiveVariantEntityOrThrow(request.getProductId(), request.getVariantId());
        }

        List<CartItem> existing = cartItemRepository.findByCustomerId(customerId);

        CartItem cartItem = existing.stream()
                .filter(i -> i.getProductId().equals(request.getProductId()))
                .filter(i -> sameVariant(i.getVariantId(), request.getVariantId()))
                .findFirst()
                .orElse(null);

        if (cartItem != null) {
            int targetQuantity = cartItem.getQuantity() + request.getQuantity();
            validateStock(product, variant, targetQuantity);
            cartItem.setQuantity(targetQuantity);
            cartItemRepository.save(cartItem);
        } else {
            validateStock(product, variant, request.getQuantity());
            CartItem newItem = new CartItem();
            newItem.setCustomerId(customerId);
            newItem.setProductId(request.getProductId());
            newItem.setVariantId(request.getVariantId());
            newItem.setProductName(buildProductName(product, variant));
            newItem.setUnitPrice(product.getPrice());
            newItem.setQuantity(request.getQuantity());
            cartItemRepository.save(newItem);
        }

        return getCart(customerId);
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
            dto.setVariantId(item.getVariantId());
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
        response.setItems(itemDtos);
        response.setTotalPrice(total);
        return response;
    }

    /**
     * Menge eines Artikels aktualisieren.
     * quantity <= 0 → Artikel entfernen.
     */
    @Transactional
    public CartResponse updateQuantity(UUID customerId, UUID cartItemId, Integer newQuantity) {
        CartItem item = findOwnedCartItem(customerId, cartItemId);

        if (newQuantity <= 0) {
            cartItemRepository.delete(item);
            return getCart(customerId);
        }

        validateStock(item, newQuantity);
        item.setQuantity(newQuantity);
        cartItemRepository.save(item);
        return getCart(customerId);
    }

    /**
     * Einzelnen Artikel aus dem Warenkorb entfernen.
     */
    @Transactional
    public CartResponse removeItem(UUID customerId, UUID cartItemId) {
        CartItem item = findOwnedCartItem(customerId, cartItemId);
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

    private CartItem findOwnedCartItem(UUID customerId, UUID cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "CartItem mit ID " + cartItemId + " nicht gefunden."));

        if (!item.getCustomerId().equals(customerId)) {
            throw new ResourceNotFoundException("CartItem mit ID " + cartItemId + " nicht gefunden.");
        }

        return item;
    }

    private void validateStock(CartItem item, int quantity) {
        if (quantity <= 0) {
            return;
        }

        if (item.getVariantId() != null) {
            ProductVariant variant = productVariantService.getActiveVariantEntityOrThrow(
                    item.getProductId(),
                    item.getVariantId()
            );
            if (!variant.hasEnoughStock(quantity)) {
                throw new BusinessException("Nicht genug Lagerbestand für Variante: " + variant.getVariantLabel());
            }
            return;
        }

        Product product = productService.getActiveProductEntityOrThrow(item.getProductId());
        if (!product.hasEnoughStock(quantity)) {
            throw new BusinessException("Nicht genug Lagerbestand für Produkt: " + product.getName());
        }
    }

    private void validateStock(Product product, ProductVariant variant, int quantity) {
        if (quantity <= 0) {
            return;
        }

        if (variant != null) {
            if (!variant.hasEnoughStock(quantity)) {
                throw new BusinessException("Nicht genug Lagerbestand für Variante: " + variant.getVariantLabel());
            }
            return;
        }

        if (!product.hasEnoughStock(quantity)) {
            throw new BusinessException("Nicht genug Lagerbestand für Produkt: " + product.getName());
        }
    }

    private boolean sameVariant(Long first, Long second) {
        if (first == null) {
            return second == null;
        }
        return first.equals(second);
    }

    private String buildProductName(Product product, ProductVariant variant) {
        if (variant == null || variant.getVariantLabel() == null) {
            return product.getName();
        }
        return product.getName() + " - " + variant.getVariantLabel();
    }
}
