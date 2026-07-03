package de.nordbyte.mavazihub.returnrequest.repository;

import de.nordbyte.mavazihub.returnrequest.entity.ReturnRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, UUID> { // <-- 1. CORRIGÉ : Long changé en UUID ici

    // Für GET /api/returns/my (UC-RS-01)
    List<ReturnRequest> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);

    // Prüfung auf doppelte Rücksendeanfragen für dieselbe Bestellung
    List<ReturnRequest> findByOrderIdAndCustomerId(UUID orderId, UUID customerId); // <-- 2. CORRIGÉ : Long changés en UUID ici
}
