package de.nordbyte.mavazihub.security;

import de.nordbyte.mavazihub.product.service.ProductService;
import de.nordbyte.mavazihub.role.entity.RoleName;
import de.nordbyte.mavazihub.user.admin.dto.AdminUserResponse;
import de.nordbyte.mavazihub.user.admin.service.AdminUserService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductService productService;

    @MockitoBean
    private AdminUserService adminUserService;

    @Test
    @WithMockUser(authorities = "ROLE_USER")
    void customerCannotAccessEmployeeProductAdministration() throws Exception {
        mockMvc.perform(get("/api/admin/products"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "ROLE_EMPLOYEE")
    void employeeCanAccessProductAdministration() throws Exception {
        when(productService.getAllProductsForAdmin()).thenReturn(List.of());

        mockMvc.perform(get("/api/admin/products"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ROLE_EMPLOYEE")
    void employeeCannotAccessUserAdministration() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "ROLE_ADMIN")
    void adminCanUpdateUserRoles() throws Exception {
        UUID userId = UUID.randomUUID();
        when(adminUserService.updateRoles(eq(userId), eq(Set.of(RoleName.ROLE_USER, RoleName.ROLE_EMPLOYEE))))
                .thenReturn(new AdminUserResponse(
                        userId,
                        "Demo",
                        "User",
                        "demo@test.de",
                        "01701234567",
                        true,
                        false,
                        Set.of("ROLE_USER", "ROLE_EMPLOYEE"),
                        LocalDateTime.now()
                ));

        mockMvc.perform(patch("/api/admin/users/{id}/roles", userId)
                        .cookie(new Cookie("csrfToken", "test-csrf"))
                        .header("X-CSRF-Token", "test-csrf")
                        .contentType("application/json")
                        .content("""
                                {
                                  "roles": ["ROLE_USER", "ROLE_EMPLOYEE"]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId.toString()))
                .andExpect(jsonPath("$.roles").isArray());

        verify(adminUserService).updateRoles(userId, Set.of(RoleName.ROLE_USER, RoleName.ROLE_EMPLOYEE));
    }
}
