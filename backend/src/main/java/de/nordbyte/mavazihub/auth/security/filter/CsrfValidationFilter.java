package de.nordbyte.mavazihub.auth.security.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;
import java.util.Set;

@Component
public class CrsfValidationFilter extends OncePerRequestFilter {

    private static final Set<String> SAFE_METHODS = Set.of("GET", "HEAD", "OPTIONS");

    private static final Set<String> EXCLUDED_PATHS = Set.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh"
    );

    @Override
    protected void doFilterInternal(
            @NonNull  HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String method = request.getMethod();
        String path = request.getRequestURI();

        //Sichere Methoden und ausgenommene Pfade ueberspringen
        if(SAFE_METHODS.contains(method) || EXCLUDED_PATHS.contains(path)){
            filterChain.doFilter(request, response);
            return;
        }

        String csrfCookie = extractCsrfFromCookie(request);
        String csrfHeader = request.getHeader("X-CSRF-Token");

        // Double-Submit-Prüfung: Cookie-Wert muss Header-Wert entsprechen
        if (csrfCookie == null || !csrfCookie.equals(csrfHeader)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"status\":403,\"error\":\"Forbidden\"," +
                            "\"message\":\"CSRF token validation failed\"}"
            );
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String extractCsrfFromCookie(HttpServletRequest request) {
        return Optional.ofNullable(request.getCookies())
                .stream()
                .flatMap(Arrays::stream)
                .filter(c -> "csrfToken".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}
