package de.nordbyte.mavazihub.product.controller;

import de.nordbyte.mavazihub.product.dto.CreateProductRequest;
import de.nordbyte.mavazihub.product.dto.ProductDetailResponse;
import de.nordbyte.mavazihub.product.dto.ProductResponse;
import de.nordbyte.mavazihub.product.dto.UpdateProductRequest;
import de.nordbyte.mavazihub.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Stellt geschützte Endpunkte für die Produktverwaltung bereit.
 */
@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    /**
     * Gibt alle Produkte für die Verwaltung zurück.
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProductsForAdmin() {
        return ResponseEntity.ok(productService.getAllProductsForAdmin());
    }

    /**
     * Gibt ein Produkt für die Verwaltung zurück.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailResponse> getProductForAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductForAdmin(id));
    }

    /**
     * Legt ein neues Produkt an.
     */
    @PostMapping
    public ResponseEntity<ProductDetailResponse> createProduct(
            @Valid @RequestBody CreateProductRequest request
    ) {
        ProductDetailResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Bearbeitet ein bestehendes Produkt.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProductDetailResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request
    ) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    /**
     * Deaktiviert ein Produkt.
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ProductDetailResponse> deactivateProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.deactivateProduct(id));
    }

    /**
     * Veröffentlicht ein Produkt wieder.
     */
    @PatchMapping("/{id}/publish")
    public ResponseEntity<ProductDetailResponse> publishProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.publishProduct(id));
    }
}