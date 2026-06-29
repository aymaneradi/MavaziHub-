package de.nordbyte.mavazihub.product.controller;

import de.nordbyte.mavazihub.product.dto.CreateProductVariantRequest;
import de.nordbyte.mavazihub.product.dto.ProductVariantResponse;
import de.nordbyte.mavazihub.product.dto.UpdateProductVariantRequest;
import de.nordbyte.mavazihub.product.dto.UpdateStockRequest;
import de.nordbyte.mavazihub.product.service.ProductVariantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Stellt geschützte Endpunkte für die Variantenverwaltung bereit.
 */
@RestController
@RequestMapping("/api/admin/products/{productId}/variants")
@RequiredArgsConstructor
public class AdminProductVariantController {

    private final ProductVariantService productVariantService;

    /**
     * Gibt alle Varianten eines Produkts für die Verwaltung zurück.
     */
    @GetMapping
    public ResponseEntity<List<ProductVariantResponse>> getVariantsForAdmin(@PathVariable Long productId) {
        return ResponseEntity.ok(productVariantService.getAllVariantsForAdmin(productId));
    }

    /**
     * Legt eine neue Produktvariante an.
     */
    @PostMapping
    public ResponseEntity<ProductVariantResponse> createVariant(
            @PathVariable Long productId,
            @Valid @RequestBody CreateProductVariantRequest request
    ) {
        ProductVariantResponse response = productVariantService.createVariant(productId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Bearbeitet eine Produktvariante.
     */
    @PutMapping("/{variantId}")
    public ResponseEntity<ProductVariantResponse> updateVariant(
            @PathVariable Long productId,
            @PathVariable Long variantId,
            @Valid @RequestBody UpdateProductVariantRequest request
    ) {
        return ResponseEntity.ok(productVariantService.updateVariant(productId, variantId, request));
    }

    /**
     * Aktualisiert den Lagerbestand einer Produktvariante.
     */
    @PatchMapping("/{variantId}/stock")
    public ResponseEntity<ProductVariantResponse> updateStock(
            @PathVariable Long productId,
            @PathVariable Long variantId,
            @Valid @RequestBody UpdateStockRequest request
    ) {
        return ResponseEntity.ok(productVariantService.updateStock(productId, variantId, request));
    }

    /**
     * Deaktiviert eine Produktvariante.
     */
    @PatchMapping("/{variantId}/deactivate")
    public ResponseEntity<ProductVariantResponse> deactivateVariant(
            @PathVariable Long productId,
            @PathVariable Long variantId
    ) {
        return ResponseEntity.ok(productVariantService.deactivateVariant(productId, variantId));
    }

    /**
     * Aktiviert eine Produktvariante.
     */
    @PatchMapping("/{variantId}/activate")
    public ResponseEntity<ProductVariantResponse> activateVariant(
            @PathVariable Long productId,
            @PathVariable Long variantId
    ) {
        return ResponseEntity.ok(productVariantService.activateVariant(productId, variantId));
    }
}