package de.nordbyte.mavazihub.order.repository;

import de.nordbyte.mavazihub.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {


    List<Order> findByCustomerIdOrderByOrderDateDesc(UUID customerId);

    Optional<Order> findByIdAndCustomerId(UUID id, UUID customerId);
}
