package de.nordbyte.mavazihub.cart.repository;

import de.nordbyte.mavazihub.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {

    List<CartItem> findByCustomerId(UUID customerId);

    @Transactional
    void deleteByCustomerId(UUID customerId);
}