package de.nordbyte.mavazihub.product.controller;

import de.nordbyte.mavazihub.product.dto.CategoryResponse;
import de.nordbyte.mavazihub.product.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Stellt öffentliche Endpunkte für Kategorien bereit.
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * Gibt alle Kategorien zurück.
     */
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }
}