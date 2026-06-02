package de.nordbyte.mavazihub.auth.service;

import de.nordbyte.mavazihub.auth.dto.RegisterRequest;
import de.nordbyte.mavazihub.role.entity.Role;
import de.nordbyte.mavazihub.role.entity.RoleName;
import de.nordbyte.mavazihub.role.repository.RoleRepository;
import de.nordbyte.mavazihub.user.entity.User;
import de.nordbyte.mavazihub.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService{
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())){
            throw new IllegalArgumentException(
                    "Email already exists"
            );
        }

        Role userRole = roleRepository.findByName(RoleName.ROLE_USER).orElseThrow();

        User user = User.builder()
                .firstname(request.firstname())
                .lastname(request.lastname())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .enabled(true)
                .accountLocked(false)
                .roles(Set.of(userRole))
                .build();

        userRepository.save(user);
    }
}
