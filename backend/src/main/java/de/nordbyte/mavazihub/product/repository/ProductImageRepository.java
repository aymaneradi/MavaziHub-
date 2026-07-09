package de.nordbyte.mavazihub.product.repository;

import de.nordbyte.mavazihub.product.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Stellt Datenbankzugriffe für Produktbilder bereit.
 */
@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
}
