package de.nordbyte.mavazihub.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.nordbyte.mavazihub.auth.dto.AuthResponse;
import de.nordbyte.mavazihub.auth.dto.LoginRequest;
import de.nordbyte.mavazihub.auth.security.cookie.AuthCookieService;
import de.nordbyte.mavazihub.auth.security.jwt.JwtProperties;
import de.nordbyte.mavazihub.auth.service.AuthService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private AuthService authService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        authService = mock(AuthService.class);
        JwtProperties jwtProperties = new JwtProperties();
        jwtProperties.setRefreshTokenExpiration(604800000);

        AuthCookieService authCookieService = new AuthCookieService(jwtProperties);
        mockMvc = MockMvcBuilders
                .standaloneSetup(new AuthController(authService, authCookieService))
                .build();
    }

    @Test
    void loginSetsHttpOnlyAuthCookiesAndReadableCsrfCookie() throws Exception {
        when(authService.login(any(LoginRequest.class)))
                .thenReturn(new AuthResponse("access.jwt", "refresh-token", 900000L));

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest("customer@test.de", "Demo12345!")
                        )))
                .andExpect(status().isNoContent())
                .andReturn();

        List<String> setCookies = result.getResponse().getHeaders(HttpHeaders.SET_COOKIE);

        assertThat(setCookies).anySatisfy(cookie -> assertThat(cookie)
                .contains("accessToken=access.jwt")
                .contains("HttpOnly")
                .contains("SameSite=Lax"));
        assertThat(setCookies).anySatisfy(cookie -> assertThat(cookie)
                .contains("refreshToken=refresh-token")
                .contains("HttpOnly")
                .contains("SameSite=Lax"));
        assertThat(setCookies).anySatisfy(cookie -> assertThat(cookie)
                .contains("csrfToken=")
                .doesNotContain("HttpOnly")
                .contains("SameSite=Lax"));
    }

    @Test
    void refreshReadsRefreshTokenCookieAndRotatesCookies() throws Exception {
        when(authService.refresh("old-refresh-token"))
                .thenReturn(new AuthResponse("new-access.jwt", "new-refresh-token", 900000L));

        MvcResult result = mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie(AuthCookieService.REFRESH_TOKEN_COOKIE, "old-refresh-token")))
                .andExpect(status().isNoContent())
                .andReturn();

        verify(authService).refresh("old-refresh-token");
        assertThat(result.getResponse().getHeaders(HttpHeaders.SET_COOKIE))
                .anySatisfy(cookie -> assertThat(cookie).contains("accessToken=new-access.jwt"));
    }

    @Test
    void logoutRevokesRefreshTokenCookieAndClearsCookies() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/logout")
                        .cookie(new Cookie(AuthCookieService.REFRESH_TOKEN_COOKIE, "old-refresh-token")))
                .andExpect(status().isNoContent())
                .andReturn();

        verify(authService).logout("old-refresh-token");
        assertThat(result.getResponse().getHeaders(HttpHeaders.SET_COOKIE))
                .anySatisfy(cookie -> assertThat(cookie)
                        .contains("accessToken=")
                        .contains("Max-Age=0"));
    }
}
