package de.nordbyte.mavazihub.product.repository;

import de.nordbyte.mavazihub.product.entity.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Stellt Datenbankzugriffe für Produkte bereit.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Gibt alle aktiven Produkte alphabetisch sortiert zurück.
     */
    @EntityGraph(attributePaths = {"category"})
    List<Product> findAllByActiveTrueOrderByNameAsc();

    /**
     * Sucht ein aktives Produkt anhand der ID.
     */
    Optional<Product> findByIdAndActiveTrue(Long id);

    /**
     * Gibt alle Produkte einer Kategorie zurück, die aktiv sind.
     */
    List<Product> findAllByCategoryIdAndActiveTrueOrderByNameAsc(Long categoryId);

    /**
     * Gibt aktive Produkte zurück, deren Name den Suchbegriff enthält.
     */
    List<Product> findAllByNameContainingIgnoreCaseAndActiveTrueOrderByNameAsc(String search);

    /**
     * Gibt aktive Produkte einer Kategorie zurück, deren Name den Suchbegriff enthält.
     */
    List<Product> findAllByCategoryIdAndNameContainingIgnoreCaseAndActiveTrueOrderByNameAsc(Long categoryId, String search);

    /**
     * Gibt alle Produkte für die Verwaltung sortiert zurück.
     */
    List<Product> findAllByOrderByNameAsc();

    /**
     * Prüft, ob ein Produktname bereits existiert.
     */
    boolean existsByNameIgnoreCase(String name);

    /**
     * Prüft, ob ein anderer Datensatz denselben Produktnamen besitzt.
     */
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}