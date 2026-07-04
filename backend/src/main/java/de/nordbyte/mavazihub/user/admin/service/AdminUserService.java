package de.nordbyte.mavazihub.user.admin.service;

import de.nordbyte.mavazihub.user.admin.dto.AdminUserResponse;
import de.nordbyte.mavazihub.user.admin.dto.AssignRoleRequest;
import de.nordbyte.mavazihub.role.entity.RoleName;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface AdminUserService {
    List<AdminUserResponse> getAllUsers();
    AdminUserResponse getUserById(UUID id);
    void assignRole(AssignRoleRequest request);
    void removeRole(AssignRoleRequest request);
    AdminUserResponse updateRoles(UUID userId, Set<RoleName> roles);
    void lockAccount(UUID userId);
    void unlockAccount(UUID userId);
    void disableUser(UUID userId);
    void enableUser(UUID userId);
    void deleteUser(UUID userId);
}
