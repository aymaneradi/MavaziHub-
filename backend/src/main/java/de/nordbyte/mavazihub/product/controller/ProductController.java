package de.nordbyte.mavazihub.product.controller;

import de.nordbyte.mavazihub.product.dto.ProductDetailResponse;
import de.nordbyte.mavazihub.product.dto.ProductResponse;
import de.nordbyte.mavazihub.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Stellt öffentliche Endpunkte für den Produktkatalog bereit.
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /**
     * Gibt aktive Produkte zurück.
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(productService.getProducts(categoryId, search));
    }

    /**
     * Gibt Details zu einem aktiven Produkt zurück.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailResponse> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }
}