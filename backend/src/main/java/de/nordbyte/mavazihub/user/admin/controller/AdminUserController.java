package de.nordbyte.mavazihub.user.admin.controller;

import de.nordbyte.mavazihub.user.admin.dto.AdminUserResponse;
import de.nordbyte.mavazihub.user.admin.dto.AssignRoleRequest;
import de.nordbyte.mavazihub.user.admin.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {
    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> getAllUsers(){
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminUserResponse> getUserById(@PathVariable UUID id){
        return ResponseEntity.ok(adminUserService.getUserById(id));
    }

    @PostMapping("/assign-role")
    public ResponseEntity<Void> assignRole(@Valid @RequestBody AssignRoleRequest request){
        adminUserService.assignRole(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/remove-role")
    public ResponseEntity<Void> removeRole(@Valid @RequestBody AssignRoleRequest request){
        adminUserService.removeRole(request);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/lock")
    public ResponseEntity<Void> lockAccount(@PathVariable UUID id){
        adminUserService.lockAccount(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/unlock")
    public ResponseEntity<Void> unlockAccount(@PathVariable UUID id){
        adminUserService.unlockAccount(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id){
        adminUserService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
