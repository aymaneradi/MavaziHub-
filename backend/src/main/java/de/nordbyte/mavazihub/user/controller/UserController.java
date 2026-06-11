package de.nordbyte.mavazihub.user.controller;

import de.nordbyte.mavazihub.auth.security.model.CustomerUserDetails;
import de.nordbyte.mavazihub.user.dto.UserResponse;
import de.nordbyte.mavazihub.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication authentication) {
        CustomerUserDetails userDetails =
                (CustomerUserDetails) authentication.getPrincipal();

        User user = userDetails.getUser();

        UserResponse response = new UserResponse(
                user.getId(),
                user.getFirstname(),
                user.getLastname(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .collect(Collectors.toSet())
        );

        return ResponseEntity.ok(response);
    }
}
