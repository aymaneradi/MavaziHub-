package de.nordbyte.mavazihub.product.service;

import de.nordbyte.mavazihub.common.exception.BusinessException;
import de.nordbyte.mavazihub.common.exception.ResourceNotFoundException;
import de.nordbyte.mavazihub.product.dto.CategoryResponse;
import de.nordbyte.mavazihub.product.dto.CreateCategoryRequest;
import de.nordbyte.mavazihub.product.dto.UpdateCategoryRequest;
import de.nordbyte.mavazihub.product.entity.Category;
import de.nordbyte.mavazihub.product.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Enthält die Geschäftslogik für Produktkategorien.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    /**
     * Gibt alle Kategorien sortiert zurück.
     */
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Legt eine neue Kategorie an.
     */
    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        String name = normalizeText(request.getName());

        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new BusinessException("Kategorie existiert bereits: " + name);
        }

        Category category = Category.builder()
                .name(name)
                .description(normalizeOptionalText(request.getDescription()))
                .build();

        Category savedCategory = categoryRepository.save(category);
        return toResponse(savedCategory);
    }

    /**
     * Bearbeitet eine bestehende Kategorie.
     */
    @Transactional
    public CategoryResponse updateCategory(Long id, UpdateCategoryRequest request) {
        Category category = getCategoryEntityOrThrow(id);
        String name = normalizeText(request.getName());

        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new BusinessException("Eine andere Kategorie mit diesem Namen existiert bereits: " + name);
        }

        category.update(name, normalizeOptionalText(request.getDescription()));

        Category savedCategory = categoryRepository.save(category);
        return toResponse(savedCategory);
    }

    /**
     * Lädt eine Kategorie als Entity oder wirft eine Ausnahme.
     */
    public Category getCategoryEntityOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kategorie nicht gefunden mit ID: " + id));
    }

    /**
     * Wandelt eine Category-Entity in ein Response-DTO um.
     */
    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription()
        );
    }

    /**
     * Entfernt unnötige Leerzeichen aus Pflichttexten.
     */
    private String normalizeText(String value) {
        return value.trim();
    }

    /**
     * Entfernt unnötige Leerzeichen aus optionalen Texten.
     */
    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}