package de.nordbyte.mavazihub.product.service;

import de.nordbyte.mavazihub.common.exception.BusinessException;
import de.nordbyte.mavazihub.common.exception.ResourceNotFoundException;
import de.nordbyte.mavazihub.product.dto.CreateProductVariantRequest;
import de.nordbyte.mavazihub.product.dto.ProductVariantResponse;
import de.nordbyte.mavazihub.product.dto.UpdateProductVariantRequest;
import de.nordbyte.mavazihub.product.dto.UpdateStockRequest;
import de.nordbyte.mavazihub.product.entity.Product;
import de.nordbyte.mavazihub.product.entity.ProductVariant;
import de.nordbyte.mavazihub.product.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

/**
 * Enthält die Geschäftslogik für Produktvarianten.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductVariantService {

    private final ProductVariantRepository productVariantRepository;
    private final ProductService productService;

    /**
     * Gibt aktive Varianten eines aktiven Produkts zurück.
     */
    public List<ProductVariantResponse> getActiveVariantsForProduct(Long productId) {
        productService.getActiveProductEntityOrThrow(productId);

        return productVariantRepository.findAllByProductIdAndActiveTrueOrderBySizeAscColorAscPatternAsc(productId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Gibt alle Varianten eines Produkts für die Verwaltung zurück.
     */
    public List<ProductVariantResponse> getAllVariantsForAdmin(Long productId) {
        productService.getProductEntityOrThrow(productId);

        return productVariantRepository.findAllByProductIdOrderBySizeAscColorAscPatternAsc(productId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Legt eine neue Variante für ein Produkt an.
     */
    @Transactional
    public ProductVariantResponse createVariant(Long productId, CreateProductVariantRequest request) {
        Product product = productService.getProductEntityOrThrow(productId);

        String size = normalizeOptionalText(request.getSize());
        String color = normalizeOptionalText(request.getColor());
        String pattern = normalizeOptionalText(request.getPattern());

        validateVariantAttributes(size, color, pattern);
        ensureVariantCombinationDoesNotExist(productId, size, color, pattern, null);

        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .size(size)
                .color(color)
                .pattern(pattern)
                .stockQuantity(request.getStockQuantity())
                .active(true)
                .build();

        ProductVariant savedVariant = productVariantRepository.save(variant);
        return toResponse(savedVariant);
    }

    /**
     * Bearbeitet eine bestehende Produktvariante.
     */
    @Transactional
    public ProductVariantResponse updateVariant(Long productId, Long variantId, UpdateProductVariantRequest request) {
        ProductVariant variant = getVariantEntityForProductOrThrow(productId, variantId);

        String size = normalizeOptionalText(request.getSize());
        String color = normalizeOptionalText(request.getColor());
        String pattern = normalizeOptionalText(request.getPattern());

        validateVariantAttributes(size, color, pattern);
        ensureVariantCombinationDoesNotExist(productId, size, color, pattern, variantId);

        variant.update(size, color, pattern);

        ProductVariant savedVariant = productVariantRepository.save(variant);
        return toResponse(savedVariant);
    }

    /**
     * Aktualisiert den Lagerbestand einer Produktvariante.
     */
    @Transactional
    public ProductVariantResponse updateStock(Long productId, Long variantId, UpdateStockRequest request) {
        ProductVariant variant = getVariantEntityForProductOrThrow(productId, variantId);

        variant.updateStock(request.getStockQuantity());

        ProductVariant savedVariant = productVariantRepository.save(variant);
        return toResponse(savedVariant);
    }

    /**
     * Deaktiviert eine Produktvariante.
     */
    @Transactional
    public ProductVariantResponse deactivateVariant(Long productId, Long variantId) {
        ProductVariant variant = getVariantEntityForProductOrThrow(productId, variantId);

        if (!variant.isActive()) {
            throw new BusinessException("Produktvariante ist bereits deaktiviert");
        }

        variant.deactivate();

        ProductVariant savedVariant = productVariantRepository.save(variant);
        return toResponse(savedVariant);
    }

    /**
     * Aktiviert eine Produktvariante.
     */
    @Transactional
    public ProductVariantResponse activateVariant(Long productId, Long variantId) {
        ProductVariant variant = getVariantEntityForProductOrThrow(productId, variantId);

        if (variant.isActive()) {
            throw new BusinessException("Produktvariante ist bereits aktiv");
        }

        variant.activate();

        ProductVariant savedVariant = productVariantRepository.save(variant);
        return toResponse(savedVariant);
    }

    /**
     * Lädt eine aktive Produktvariante als Entity.
     */
    public ProductVariant getActiveVariantEntityOrThrow(Long productId, Long variantId) {
        productService.getActiveProductEntityOrThrow(productId);

        return productVariantRepository.findByIdAndProductIdAndActiveTrue(variantId, productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aktive Produktvariante nicht gefunden mit ID: " + variantId
                ));
    }

    /**
     * Reduziert den Lagerbestand einer aktiven Variante.
     */
    @Transactional
    public ProductVariant reduceStock(Long productId, Long variantId, int quantity) {
        if (quantity <= 0) {
            throw new BusinessException("Bestellmenge muss größer als 0 sein");
        }

        ProductVariant variant = getActiveVariantEntityOrThrow(productId, variantId);

        if (!variant.hasEnoughStock(quantity)) {
            throw new BusinessException("Nicht genug Lagerbestand für Variante: " + variant.getVariantLabel());
        }

        variant.reduceStock(quantity);

        return productVariantRepository.save(variant);
    }

    /**
     * Lädt eine Variante zu einem Produkt oder wirft eine Ausnahme.
     */
    private ProductVariant getVariantEntityForProductOrThrow(Long productId, Long variantId) {
        return productVariantRepository.findByIdAndProductId(variantId, productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Produktvariante nicht gefunden mit ID: " + variantId
                ));
    }

    /**
     * Prüft, ob eine Variante fachlich eindeutig beschrieben ist.
     */
    private void validateVariantAttributes(String size, String color, String pattern) {
        if (size == null && color == null && pattern == null) {
            throw new BusinessException("Mindestens Größe, Farbe oder Muster muss angegeben werden");
        }
    }

    private void ensureVariantCombinationDoesNotExist(
            Long productId, String size, String color,
            String pattern, Long ignoredVariantId) {

        boolean exists;
        String s = size  == null ? "" : size;
        String c = color == null ? "" : color;
        String p = pattern == null ? "" : pattern;

        if (ignoredVariantId == null) {
            exists = productVariantRepository
                    .existsByProductIdAndSizeIgnoreCaseAndColorIgnoreCaseAndPatternIgnoreCase(
                            productId, s, c, p);
        } else {
            exists = productVariantRepository
                    .existsByProductIdAndSizeIgnoreCaseAndColorIgnoreCaseAndPatternIgnoreCaseAndIdNot(
                            productId, s, c, p, ignoredVariantId);
        }

        if (exists) {
            throw new BusinessException("Diese Produktvariante existiert bereits");
        }
    }
// → Datenbank prüft, nicht Java → schneller, kein Speicherproblem

    /**
     * Vergleicht zwei Texte ohne Beachtung der Groß- und Kleinschreibung.
     */
    private boolean sameText(String first, String second) {
        return normalizeForComparison(first).equals(normalizeForComparison(second));
    }

    /**
     * Normalisiert Text für Vergleiche.
     */
    private String normalizeForComparison(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }

        return value.trim().toLowerCase();
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

    /**
     * Wandelt eine ProductVariant-Entity in ein Response-DTO um.
     */
    private ProductVariantResponse toResponse(ProductVariant variant) {
        return new ProductVariantResponse(
                variant.getId(),
                variant.getProduct().getId(),
                variant.getSize(),
                variant.getColor(),
                variant.getPattern(),
                variant.getStockQuantity(),
                variant.isActive(),
                variant.getVariantLabel()
        );
    }
}