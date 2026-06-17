package de.nordbyte.mavazihub.returns.repository;

import de.nordbyte.mavazihub.returns.entity.ReturnRequest;
import de.nordbyte.mavazihub.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, UUID> {
    List<ReturnRequest> findByCustomerOrderByCreatedAtDesc(User customer);

    Optional<ReturnRequest> findByIdAndCustomer(UUID id, User customer);

    List<ReturnRequest> findAllByOrderByCreatedAtDesc();
}
