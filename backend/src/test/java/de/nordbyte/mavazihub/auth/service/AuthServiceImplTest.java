package de.nordbyte.mavazihub.auth.service;

import de.nordbyte.mavazihub.auth.dto.LoginRequest;
import de.nordbyte.mavazihub.auth.security.jwt.JwtProperties;
import de.nordbyte.mavazihub.auth.security.jwt.JwtService;
import de.nordbyte.mavazihub.role.repository.RoleRepository;
import de.nordbyte.mavazihub.token.entity.RefreshToken;
import de.nordbyte.mavazihub.token.service.RefreshTokenServiceImpl;
import de.nordbyte.mavazihub.user.entity.User;
import de.nordbyte.mavazihub.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private JwtProperties jwtProperties;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private RefreshTokenServiceImpl refreshTokenService;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void loginRejectsDisabledUser() {
        LoginRequest request = new LoginRequest("disabled@test.de", "Demo12345!");
        when(authenticationManager.authenticate(any()))
                .thenThrow(new DisabledException("disabled"));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(DisabledException.class);

        verifyNoInteractions(userRepository, jwtService, refreshTokenService);
    }

    @Test
    void refreshRejectsDisabledUserAndRevokesRefreshToken() {
        User user = new User();
        user.setEmail("disabled@test.de");
        user.setEnabled(false);
        user.setAccountLocked(false);

        RefreshToken refreshToken = RefreshToken.builder()
                .token("old-refresh-token")
                .user(user)
                .build();

        when(refreshTokenService.validateRefreshToken("old-refresh-token"))
                .thenReturn(refreshToken);

        assertThatThrownBy(() -> authService.refresh("old-refresh-token"))
                .isInstanceOf(DisabledException.class);

        verify(refreshTokenService).revokeRefreshToken("old-refresh-token");
        verifyNoInteractions(jwtService);
    }
}
