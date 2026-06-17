package de.nordbyte.mavazihub.order.repository;

import de.nordbyte.mavazihub.order.entity.Order;
import de.nordbyte.mavazihub.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByCustomerOrderByCreatedAtDesc(User customer);

    Optional<Order> findByIdAndCustomer(UUID id, User customer);
}
