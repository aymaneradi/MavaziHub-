package de.nordbyte.mavazihub.product.repository;

import de.nordbyte.mavazihub.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Stellt Datenbankzugriffe für Produktkategorien bereit.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * Sucht eine Kategorie anhand des Namens ohne Beachtung der Groß- und Kleinschreibung.
     */
    Optional<Category> findByNameIgnoreCase(String name);

    /**
     * Prüft, ob bereits eine Kategorie mit diesem Namen existiert.
     */
    boolean existsByNameIgnoreCase(String name);

    /**
     * Prüft, ob eine andere Kategorie mit demselben Namen existiert.
     */
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    /**
     * Gibt alle Kategorien alphabetisch sortiert zurück.
     */
    List<Category> findAllByOrderByNameAsc();
}