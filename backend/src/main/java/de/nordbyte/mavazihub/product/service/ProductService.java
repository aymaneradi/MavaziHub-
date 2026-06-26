package de.nordbyte.mavazihub.product.service;

import de.nordbyte.mavazihub.common.exception.BusinessException;
import de.nordbyte.mavazihub.common.exception.ResourceNotFoundException;
import de.nordbyte.mavazihub.product.dto.CreateProductRequest;
import de.nordbyte.mavazihub.product.dto.ProductDetailResponse;
import de.nordbyte.mavazihub.product.dto.ProductResponse;
import de.nordbyte.mavazihub.product.dto.UpdateProductRequest;
import de.nordbyte.mavazihub.product.entity.Category;
import de.nordbyte.mavazihub.product.entity.Product;
import de.nordbyte.mavazihub.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Enthält die Geschäftslogik für Produkte.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryService categoryService;

    /**
     * Gibt aktive Produkte für die öffentliche Produktübersicht zurück.
     */
    public List<ProductResponse> getProducts(Long categoryId, String search) {
        List<Product> products;

        boolean hasCategoryFilter = categoryId != null;
        boolean hasSearchFilter = search != null && !search.isBlank();

        if (hasCategoryFilter) {
            categoryService.getCategoryEntityOrThrow(categoryId);
        }

        if (hasCategoryFilter && hasSearchFilter) {
            products = productRepository.findAllByCategoryIdAndNameContainingIgnoreCaseAndActiveTrueOrderByNameAsc(
                    categoryId,
                    search.trim()
            );
        } else if (hasCategoryFilter) {
            products = productRepository.findAllByCategoryIdAndActiveTrueOrderByNameAsc(categoryId);
        } else if (hasSearchFilter) {
            products = productRepository.findAllByNameContainingIgnoreCaseAndActiveTrueOrderByNameAsc(search.trim());
        } else {
            products = productRepository.findAllByActiveTrueOrderByNameAsc();
        }

        return products.stream()
                .map(this::toProductResponse)
                .toList();
    }

    /**
     * Gibt Details zu einem aktiven Produkt zurück.
     */
    public ProductDetailResponse getProductById(Long id) {
        Product product = productRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produkt nicht gefunden mit ID: " + id));

        return toProductDetailResponse(product);
    }

    /**
     * Gibt alle Produkte für die interne Verwaltung zurück.
     */
    public List<ProductResponse> getAllProductsForAdmin() {
        return productRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toProductResponse)
                .toList();
    }

    /**
     * Gibt ein Produkt für die interne Verwaltung zurück.
     */
    public ProductDetailResponse getProductForAdmin(Long id) {
        Product product = getProductEntityOrThrow(id);
        return toProductDetailResponse(product);
    }

    /**
     * Legt ein neues Produkt an.
     */
    @Transactional
    public ProductDetailResponse createProduct(CreateProductRequest request) {
        String name = normalizeText(request.getName());

        if (productRepository.existsByNameIgnoreCase(name)) {
            throw new BusinessException("Produkt existiert bereits: " + name);
        }

        Category category = categoryService.getCategoryEntityOrThrow(request.getCategoryId());

        Product product = Product.builder()
                .name(name)
                .description(normalizeOptionalText(request.getDescription()))
                .price(request.getPrice())
                .imageUrl(normalizeOptionalText(request.getImageUrl()))
                .stockQuantity(request.getStockQuantity())
                .active(true)
                .category(category)
                .build();

        Product savedProduct = productRepository.save(product);
        return toProductDetailResponse(savedProduct);
    }

    /**
     * Bearbeitet ein bestehendes Produkt.
     */
    @Transactional
    public ProductDetailResponse updateProduct(Long id, UpdateProductRequest request) {
        Product product = getProductEntityOrThrow(id);
        String name = normalizeText(request.getName());

        if (productRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new BusinessException("Ein anderes Produkt mit diesem Namen existiert bereits: " + name);
        }

        Category category = categoryService.getCategoryEntityOrThrow(request.getCategoryId());

        product.updateBasicData(
                name,
                normalizeOptionalText(request.getDescription()),
                request.getPrice(),
                normalizeOptionalText(request.getImageUrl()),
                request.getStockQuantity(),
                category
        );

        Product savedProduct = productRepository.save(product);
        return toProductDetailResponse(savedProduct);
    }

    /**
     * Deaktiviert ein Produkt.
     */
    @Transactional
    public ProductDetailResponse deactivateProduct(Long id) {
        Product product = getProductEntityOrThrow(id);

        if (!product.isActive()) {
            throw new BusinessException("Produkt ist bereits deaktiviert: " + product.getName());
        }

        product.deactivate();

        Product savedProduct = productRepository.save(product);
        return toProductDetailResponse(savedProduct);
    }

    /**
     * Veröffentlicht ein deaktiviertes Produkt wieder.
     */
    @Transactional
    public ProductDetailResponse publishProduct(Long id) {
        Product product = getProductEntityOrThrow(id);

        if (product.isActive()) {
            throw new BusinessException("Produkt ist bereits veröffentlicht: " + product.getName());
        }

        product.publish();

        Product savedProduct = productRepository.save(product);
        return toProductDetailResponse(savedProduct);
    }

    /**
     * Lädt eine Produkt-Entity oder wirft eine Ausnahme.
     */
    public Product getProductEntityOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produkt nicht gefunden mit ID: " + id));
    }

    /**
     * Lädt eine aktive Produkt-Entity oder wirft eine Ausnahme.
     */
    public Product getActiveProductEntityOrThrow(Long id) {
        return productRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aktives Produkt nicht gefunden mit ID: " + id));
    }

    /**
     * Wandelt eine Product-Entity in ein Übersichts-DTO um.
     */
    private ProductResponse toProductResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getImageUrl(),
                product.getStockQuantity(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.isActive()
        );
    }

    /**
     * Wandelt eine Product-Entity in ein Detail-DTO um.
     */
    private ProductDetailResponse toProductDetailResponse(Product product) {
        return new ProductDetailResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getImageUrl(),
                product.getStockQuantity(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.isActive(),
                product.getCreatedAt(),
                product.getUpdatedAt()
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