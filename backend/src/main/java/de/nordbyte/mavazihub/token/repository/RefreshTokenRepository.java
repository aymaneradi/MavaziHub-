package de.nordbyte.mavazihub.token.repository;

import de.nordbyte.mavazihub.token.entity.RefreshToken;
import de.nordbyte.mavazihub.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByToken (String token);
    void deleteAllByUser(User user);
}
