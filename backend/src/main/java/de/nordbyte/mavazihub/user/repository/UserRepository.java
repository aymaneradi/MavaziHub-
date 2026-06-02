package de.nordbyte.mavazihub.user.repository;

import de.nordbyte.mavazihub.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhonenumber (String phone);
    boolean existsByEmail(String email);
}
