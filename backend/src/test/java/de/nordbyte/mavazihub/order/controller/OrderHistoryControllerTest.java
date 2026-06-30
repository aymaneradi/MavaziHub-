package de.nordbyte.mavazihub.order.controller;

import de.nordbyte.mavazihub.auth.security.model.CustomerUserDetails;
import de.nordbyte.mavazihub.order.dto.OrderDetailResponse;
import de.nordbyte.mavazihub.order.dto.OrderItemResponse;
import de.nordbyte.mavazihub.order.dto.OrderSummaryResponse;
import de.nordbyte.mavazihub.order.service.OrderHistoryService;
import de.nordbyte.mavazihub.role.entity.Role;
import de.nordbyte.mavazihub.role.entity.RoleName;
import de.nordbyte.mavazihub.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OrderHistoryControllerTest {

    private OrderHistoryService orderHistoryService;
    private MockMvc mockMvc;
    private User customer;
    private UsernamePasswordAuthenticationToken authentication;

    @BeforeEach
    void setUp() {
        orderHistoryService = mock(OrderHistoryService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new OrderHistoryController(orderHistoryService)).build();
        customer = customer(UUID.randomUUID());
        authentication = new UsernamePasswordAuthenticationToken(new CustomerUserDetails(customer), null);
    }

    @Test
    void getMyOrdersReturnsAuthenticatedCustomersOrderHistory() throws Exception {
        UUID orderId = UUID.randomUUID();
        when(orderHistoryService.getOrderHistory(eq(customer))).thenReturn(List.of(
                new OrderSummaryResponse(orderId, "PAID", "PAID", BigDecimal.valueOf(59.99), LocalDateTime.now())
        ));

        mockMvc.perform(get("/api/me/orders").principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(orderId.toString()))
                .andExpect(jsonPath("$[0].status").value("PAID"));
    }

    @Test
    void getMyOrderReturnsOrderDetails() throws Exception {
        UUID orderId = UUID.randomUUID();
        UUID itemId = UUID.randomUUID();
        when(orderHistoryService.getOrderDetails(eq(orderId), eq(customer))).thenReturn(
                new OrderDetailResponse(
                        orderId,
                        customer.getId(),
                        "PAID",
                        "PAID",
                        BigDecimal.valueOf(99.99),
                        "Test Street 1",
                        "12345",
                        "Berlin",
                        LocalDateTime.now(),
                        List.of(item(itemId, 2))
                )
        );

        mockMvc.perform(get("/api/me/orders/{orderId}", orderId).principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(orderId.toString()))
                .andExpect(jsonPath("$.items[0].id").value(itemId.toString()))
                .andExpect(jsonPath("$.items[0].returnableQuantity").value(2));
    }

    @Test
    void getReturnableItemsReturnsOnlyReturnableItems() throws Exception {
        UUID orderId = UUID.randomUUID();
        UUID itemId = UUID.randomUUID();
        when(orderHistoryService.getReturnableItems(eq(orderId), eq(customer)))
                .thenReturn(List.of(item(itemId, 1)));

        mockMvc.perform(get("/api/me/orders/{orderId}/returnable-items", orderId).principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(itemId.toString()))
                .andExpect(jsonPath("$[0].returnableQuantity").value(1));
    }

    private static OrderItemResponse item(UUID itemId, int returnableQuantity) {
        return new OrderItemResponse(
                itemId,
                UUID.randomUUID(),
                "Mavazi Hoodie",
                BigDecimal.valueOf(49.99),
                2,
                returnableQuantity
        );
    }

    private static User customer(UUID customerId) {
        Role userRole = Role.builder().name(RoleName.ROLE_USER).build();
        User user = new User();
        user.setId(customerId);
        user.setEmail("customer@test.de");
        user.setPassword("secret");
        user.setEnabled(true);
        user.setRoles(Set.of(userRole));
        return user;
    }
}
