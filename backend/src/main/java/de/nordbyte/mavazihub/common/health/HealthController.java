package de.nordbyte.mavazihub.common.health;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "UP",
                "service", "mavazihub-backend",
                "timestamp", Instant.now().toString()
        );
    }

    @GetMapping("/api/health/db")
    public Map<String, Object> databaseHealth() {
        Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);

        return Map.of(
                "status", result != null && result == 1 ? "UP" : "DOWN",
                "database", "postgresql",
                "timestamp", Instant.now().toString()
        );
    }
}
