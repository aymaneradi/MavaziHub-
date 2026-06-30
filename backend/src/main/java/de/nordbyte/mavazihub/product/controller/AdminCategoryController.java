package de.nordbyte.mavazihub.product.controller;

import de.nordbyte.mavazihub.product.dto.CategoryResponse;
import de.nordbyte.mavazihub.product.dto.CreateCategoryRequest;
import de.nordbyte.mavazihub.product.dto.UpdateCategoryRequest;
import de.nordbyte.mavazihub.product.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Stellt geschützte Endpunkte für die Kategorieverwaltung bereit.
 */
@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService categoryService;

    /**
     * Legt eine neue Kategorie an.
     */
    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @Valid @RequestBody CreateCategoryRequest request
    ) {
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Bearbeitet eine bestehende Kategorie.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryRequest request
    ) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }
}