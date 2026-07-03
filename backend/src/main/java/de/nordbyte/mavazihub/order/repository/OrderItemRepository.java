package de.nordbyte.mavazihub.order.repository;

import de.nordbyte.mavazihub.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {
}
