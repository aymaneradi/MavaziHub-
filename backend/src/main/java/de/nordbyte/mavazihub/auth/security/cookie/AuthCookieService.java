package de.nordbyte.mavazihub.auth.security.cookie;

import de.nordbyte.mavazihub.auth.dto.AuthResponse;
import de.nordbyte.mavazihub.auth.security.jwt.JwtProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AuthCookieService {

    public static final String ACCESS_TOKEN_COOKIE = "accessToken";
    public static final String REFRESH_TOKEN_COOKIE = "refreshToken";
    public static final String CSRF_TOKEN_COOKIE = "csrfToken";

    private static final String COOKIE_PATH = "/";
    private static final String SAME_SITE = "Lax";

    private final JwtProperties jwtProperties;

    public void addAuthCookies(HttpServletResponse response, AuthResponse authResponse) {
        addCookie(
                response,
                ACCESS_TOKEN_COOKIE,
                authResponse.accessToken(),
                true,
                Duration.ofMillis(authResponse.expiresIn())
        );
        addCookie(
                response,
                REFRESH_TOKEN_COOKIE,
                authResponse.refreshToken(),
                true,
                Duration.ofMillis(jwtProperties.getRefreshTokenExpiration())
        );
        addCookie(
                response,
                CSRF_TOKEN_COOKIE,
                UUID.randomUUID().toString(),
                false,
                Duration.ofMillis(jwtProperties.getRefreshTokenExpiration())
        );
    }

    public void clearAuthCookies(HttpServletResponse response) {
        clearCookie(response, ACCESS_TOKEN_COOKIE, true);
        clearCookie(response, REFRESH_TOKEN_COOKIE, true);
        clearCookie(response, CSRF_TOKEN_COOKIE, false);
    }

    public Optional<String> readCookie(HttpServletRequest request, String cookieName) {
        return Optional.ofNullable(request.getCookies())
                .stream()
                .flatMap(Arrays::stream)
                .filter(cookie -> cookieName.equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter(value -> !value.isBlank())
                .findFirst();
    }

    private void addCookie(
            HttpServletResponse response,
            String name,
            String value,
            boolean httpOnly,
            Duration maxAge
    ) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(httpOnly)
                .secure(false)
                .sameSite(SAME_SITE)
                .path(COOKIE_PATH)
                .maxAge(maxAge)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearCookie(HttpServletResponse response, String name, boolean httpOnly) {
        ResponseCookie cookie = ResponseCookie.from(name, "")
                .httpOnly(httpOnly)
                .secure(false)
                .sameSite(SAME_SITE)
                .path(COOKIE_PATH)
                .maxAge(Duration.ZERO)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
