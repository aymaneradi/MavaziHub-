package de.nordbyte.mavazihub.user.admin.service;

import de.nordbyte.mavazihub.role.entity.Role;
import de.nordbyte.mavazihub.role.entity.RoleName;
import de.nordbyte.mavazihub.role.repository.RoleRepository;
import de.nordbyte.mavazihub.user.admin.dto.AdminUserResponse;
import de.nordbyte.mavazihub.user.admin.dto.AssignRoleRequest;
import de.nordbyte.mavazihub.user.entity.User;
import de.nordbyte.mavazihub.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public AdminUserResponse getUserById(UUID id) {
        return userRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(()-> new UsernameNotFoundException("user not found"));
    }

    @Override
    public void assignRole(AssignRoleRequest request) {
        User user = findUser(request.userId());
        Role role =  findRole(request.role());
        user.getRoles().add(role);
        userRepository.save(user);
    }

    @Override
    public void removeRole(AssignRoleRequest request) {
        User user = findUser(request.userId());
        Role role = findRole(request.role());
        user.getRoles().remove(role);
        userRepository.save(user);
    }

    @Override
    public AdminUserResponse updateRoles(UUID userId, Set<RoleName> roles) {
        User user = findUser(userId);
        Set<Role> resolvedRoles = roles.stream()
                .map(this::findRole)
                .collect(Collectors.toSet());

        user.setRoles(resolvedRoles);
        return toResponse(userRepository.save(user));
    }

    @Override
    public void lockAccount(UUID userId) {
        User user = findUser(userId);
        user.setAccountLocked(true);
        userRepository.save(user);
    }

    @Override
    public void unlockAccount(UUID userId) {
        User user = findUser(userId);
        user.setAccountLocked(false);
        userRepository.save(user);
    }

    @Override
    public void disableUser(UUID userId) {
        User user = findUser(userId);
        user.setEnabled(false);
        userRepository.save(user);
    }

    @Override
    public void enableUser(UUID userId) {
        User user = findUser(userId);
        user.setEnabled(true);
        userRepository.save(user);
    }

    @Override
    public void deleteUser(UUID userId) {
        User user = findUser(userId);
        userRepository.delete(user);
    }

    private User findUser(@NotNull UUID uuid) {
        return userRepository.findById(uuid)
                .orElseThrow(()-> new UsernameNotFoundException("user not found"));
    }

    private Role findRole(@NotNull RoleName roleName){
        return roleRepository.findByName(roleName)
                .orElseThrow(()-> new RuntimeException("Role not found: " + roleName));
    }


    private AdminUserResponse toResponse(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getFirstname(),
                user.getLastname(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.isEnabled(),
                user.isAccountLocked(),
                user.getRoles().stream()
                        .map(r -> r.getName().name())
                        .collect(Collectors.toSet()),
                user.getCreatedAt()
        );
    }
}
