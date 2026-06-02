package de.nordbyte.mavazihub.role.repository;

import de.nordbyte.mavazihub.role.entity.Role;
import de.nordbyte.mavazihub.role.entity.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
}
