package de.nordbyte.mavazihub.auth.service;

import de.nordbyte.mavazihub.auth.dto.AuthResponse;
import de.nordbyte.mavazihub.auth.dto.LoginRequest;
import de.nordbyte.mavazihub.auth.dto.RegisterRequest;
import de.nordbyte.mavazihub.auth.security.jwt.JwtProperties;
import de.nordbyte.mavazihub.auth.security.jwt.JwtService;
import de.nordbyte.mavazihub.common.exception.EmailAlreadyExistsException;
import de.nordbyte.mavazihub.role.entity.Role;
import de.nordbyte.mavazihub.role.entity.RoleName;
import de.nordbyte.mavazihub.role.repository.RoleRepository;
import de.nordbyte.mavazihub.token.entity.RefreshToken;
import de.nordbyte.mavazihub.token.service.RefreshTokenServiceImpl;
import de.nordbyte.mavazihub.user.entity.User;
import de.nordbyte.mavazihub.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenServiceImpl refreshTokenService;

    @Override
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException(request.email());
        }

        Role userRole = roleRepository.findByName(RoleName.ROLE_USER).orElseThrow();

        User user = User.builder()
                .firstname(request.firstname())
                .lastname(request.lastname())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .phoneNumber(request.phonenumber())
                .enabled(true)
                .accountLocked(false)
                .roles(Set.of(userRole))
                .build();

        userRepository.save(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found"
                ));

        String accessToken = jwtService.generateAccessToken(user.getEmail());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                jwtProperties.getAccessTokenExpiration()
        );
    }

    @Override
    public AuthResponse refresh(String refreshToken) {

        User user = refreshTokenService.validateRefreshToken(refreshToken).getUser();

        if (!user.isEnabled()) {
            refreshTokenService.revokeRefreshToken(refreshToken);
            throw new DisabledException("User account is disabled");
        }

        if (user.isAccountLocked()) {
            refreshTokenService.revokeRefreshToken(refreshToken);
            throw new LockedException("User account is locked");
        }

        refreshTokenService.revokeRefreshToken(refreshToken);

        String newAccessToken = jwtService.generateAccessToken(user.getEmail());
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponse(
                newAccessToken,
                newRefreshToken.getToken(),
                jwtProperties.getAccessTokenExpiration()
        );
    }

    @Override
    public void logout(String refreshToken) {
        refreshTokenService.revokeRefreshToken(refreshToken);
    }
}
