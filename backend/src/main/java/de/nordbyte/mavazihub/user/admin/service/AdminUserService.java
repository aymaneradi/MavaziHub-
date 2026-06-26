package de.nordbyte.mavazihub.user.admin.service;

import de.nordbyte.mavazihub.user.admin.dto.AdminUserResponse;
import de.nordbyte.mavazihub.user.admin.dto.AssignRoleRequest;

import java.util.List;
import java.util.UUID;

public interface AdminUserService {
    List<AdminUserResponse> getAllUsers();
    AdminUserResponse getUserById(UUID id);
    void assignRole(AssignRoleRequest request);
    void removeRole(AssignRoleRequest request);
    void lockAccount(UUID userId);
    void unlockAccount(UUID userId);
    void deleteUser(UUID userId);
}
