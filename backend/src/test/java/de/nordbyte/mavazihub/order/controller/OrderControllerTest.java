package de.nordbyte.mavazihub.order.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.nordbyte.mavazihub.auth.security.model.CustomerUserDetails;
import de.nordbyte.mavazihub.order.dto.OrderRequest;
import de.nordbyte.mavazihub.order.dto.OrderResponse;
import de.nordbyte.mavazihub.order.service.OrderService;
import de.nordbyte.mavazihub.role.entity.Role;
import de.nordbyte.mavazihub.role.entity.RoleName;
import de.nordbyte.mavazihub.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentCaptor.forClass;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OrderControllerTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private OrderService orderService;
    private MockMvc mockMvc;
    private User customer;
    private UsernamePasswordAuthenticationToken authentication;

    @BeforeEach
    void setUp() {
        orderService = mock(OrderService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new OrderController(orderService)).build();
        customer = customer(UUID.randomUUID());
        authentication = new UsernamePasswordAuthenticationToken(new CustomerUserDetails(customer), null);
    }

    @Test
    void checkoutMyCartUsesCurrentUserAsCustomerId() throws Exception {
        OrderRequest request = new OrderRequest();
        request.setStreet("Test Street 1");
        request.setZipCode("12345");
        request.setCity("Berlin");

        UUID orderId = UUID.randomUUID();
        when(orderService.processOrder(any(OrderRequest.class)))
                .thenReturn(order(orderId));

        mockMvc.perform(post("/api/me/cart/checkout")
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(orderId.toString()))
                .andExpect(jsonPath("$.status").value("PAID"));

        var captor = forClass(OrderRequest.class);
        verify(orderService).processOrder(captor.capture());
        assertThat(captor.getValue().getCustomerId()).isEqualTo(customer.getId());
    }

    private static OrderResponse order(UUID orderId) {
        OrderResponse response = new OrderResponse();
        response.setId(orderId);
        response.setStatus("PAID");
        response.setPaymentStatus("SIMULATED_PAID");
        response.setTotalPrice(BigDecimal.valueOf(49.99));
        response.setOrderDate(LocalDateTime.now());
        return response;
    }

    private static User customer(UUID customerId) {
        Role userRole = Role.builder().name(RoleName.ROLE_USER).build();
        User user = new User();
        user.setId(customerId);
        user.setFirstname("Aymane");
        user.setLastname("Radi");
        user.setEmail("customer@test.de");
        user.setPhoneNumber("0123456789");
        user.setPassword("secret");
        user.setEnabled(true);
        user.setRoles(Set.of(userRole));
        return user;
    }
}
