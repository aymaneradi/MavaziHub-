package de.nordbyte.mavazihub.returnrequest.repository;

import de.nordbyte.mavazihub.returnrequest.entity.ReturnItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReturnItemRepository extends JpaRepository<ReturnItem, UUID> {
    List<ReturnItem> findByOrderItemId(UUID orderItemId);

    @Query("""
            select coalesce(sum(item.quantity), 0)
            from ReturnItem item
            where item.orderItemId = :orderItemId
            """)
    int sumReturnedQuantityByOrderItemId(@Param("orderItemId") UUID orderItemId);
}
