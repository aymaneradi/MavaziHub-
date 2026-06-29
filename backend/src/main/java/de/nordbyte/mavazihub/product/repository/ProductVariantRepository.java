package de.nordbyte.mavazihub.product.repository;

import de.nordbyte.mavazihub.product.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
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

    // ProductVariantRepository.java — neue Methode ergänzen
    boolean existsByProductIdAndSizeIgnoreCaseAndColorIgnoreCaseAndPatternIgnoreCase(
            Long productId, String size, String color, String pattern );

    // Und für Update-Fall (andere ID ausschließen):
    boolean existsByProductIdAndSizeIgnoreCaseAndColorIgnoreCaseAndPatternIgnoreCaseAndIdNot(
            Long productId, String size, String color, String pattern, Long id );
}