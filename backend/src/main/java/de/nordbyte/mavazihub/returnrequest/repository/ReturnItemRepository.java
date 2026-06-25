package de.nordbyte.mavazihub.returnrequest.repository;

import de.nordbyte.mavazihub.returnrequest.entity.ReturnItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReturnItemRepository extends JpaRepository<ReturnItem, Long> {

    // Prüfung: wurde dieses OrderItem bereits in einer Rücksendung verwendet?
    List<ReturnItem> findByOrderItemId(UUID orderItemId);
}
