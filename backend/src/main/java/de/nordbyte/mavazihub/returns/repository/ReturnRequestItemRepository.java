package de.nordbyte.mavazihub.returns.repository;

import de.nordbyte.mavazihub.returns.entity.ReturnRequestItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface ReturnRequestItemRepository extends JpaRepository<ReturnRequestItem, UUID> {
    @Query("""
            select coalesce(sum(item.quantity), 0)
            from ReturnRequestItem item
            where item.orderItem.id = :orderItemId
              and item.returnRequest.status <> de.nordbyte.mavazihub.returns.entity.ReturnRequestStatus.REJECTED
            """)
    int sumActiveReturnQuantityByOrderItemId(@Param("orderItemId") UUID orderItemId);
}
