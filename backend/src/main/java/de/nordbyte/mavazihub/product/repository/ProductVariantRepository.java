package de.nordbyte.mavazihub.product.repository;

import de.nordbyte.mavazihub.product.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Stellt Datenbankzugriffe für Produktvarianten bereit.
 */
@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    /**
     * Gibt alle aktiven Varianten eines Produkts sortiert zurück.
     */
    List<ProductVariant> findAllByProductIdAndActiveTrueOrderBySizeAscColorAscPatternAsc(Long productId);

    /**
     * Gibt alle Varianten eines Produkts für die Verwaltung zurück.
     */
    List<ProductVariant> findAllByProductIdOrderBySizeAscColorAscPatternAsc(Long productId);

    boolean existsByProductIdAndActiveTrue(Long productId);

    /**
     * Sucht eine Variante anhand ihrer ID und Produkt-ID.
     */
    Optional<ProductVariant> findByIdAndProductId(Long id, Long productId);

    /**
     * Sucht eine aktive Variante anhand ihrer ID und Produkt-ID.
     */
    Optional<ProductVariant> findByIdAndProductIdAndActiveTrue(Long id, Long productId);

    /**
     * Sucht eine aktive Variante anhand ihrer ID.
     */
    Optional<ProductVariant> findByIdAndActiveTrue(Long id);

    @Query("""
            SELECT COUNT(variant) > 0
            FROM ProductVariant variant
            WHERE variant.product.id = :productId
              AND (:ignoredVariantId IS NULL OR variant.id <> :ignoredVariantId)
              AND lower(coalesce(variant.size, '')) = lower(coalesce(:size, ''))
              AND lower(coalesce(variant.color, '')) = lower(coalesce(:color, ''))
              AND lower(coalesce(variant.pattern, '')) = lower(coalesce(:pattern, ''))
            """)
    boolean existsByNormalizedAttributes(
            @Param("productId") Long productId,
            @Param("size") String size,
            @Param("color") String color,
            @Param("pattern") String pattern,
            @Param("ignoredVariantId") Long ignoredVariantId
    );
}
