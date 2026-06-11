package de.nordbyte.mavazihub.product.controller;

import de.nordbyte.mavazihub.product.dto.ProductVariantResponse;
import de.nordbyte.mavazihub.product.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Stellt öffentliche Endpunkte für Produktvarianten bereit.
 */
@RestController
@RequestMapping("/api/products/{productId}/variants")
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantService productVariantService;

    /**
     * Gibt aktive Varianten eines Produkts zurück.
     */
    @GetMapping
    public ResponseEntity<List<ProductVariantResponse>> getVariantsForProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(productVariantService.getActiveVariantsForProduct(productId));
    }
}