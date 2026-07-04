package de.nordbyte.mavazihub.cart.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.nordbyte.mavazihub.auth.security.model.CustomerUserDetails;
import de.nordbyte.mavazihub.cart.dto.CartItemRequest;
import de.nordbyte.mavazihub.cart.dto.CartResponse;
import de.nordbyte.mavazihub.cart.service.CartService;
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
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentCaptor.forClass;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CartControllerTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private CartService cartService;
    private MockMvc mockMvc;
    private User customer;
    private UsernamePasswordAuthenticationToken authentication;

    @BeforeEach
    void setUp() {
        cartService = mock(CartService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new CartController(cartService)).build();
        customer = customer(UUID.randomUUID());
        authentication = new UsernamePasswordAuthenticationToken(new CustomerUserDetails(customer), null);
    }

    @Test
    void getMyCartUsesCurrentUser() throws Exception {
        when(cartService.getCart(customer.getId()))
                .thenReturn(cart(customer.getId()));

        mockMvc.perform(get("/api/cart/me").principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerId").value(customer.getId().toString()))
                .andExpect(jsonPath("$.items[0].productId").value(1));
    }

    @Test
    void addToMyCartUsesCurrentUserAsCustomerId() throws Exception {
        CartItemRequest request = new CartItemRequest();
        request.setProductId(1L);
        request.setProductName("Mavazi Hoodie");
        request.setUnitPrice(BigDecimal.valueOf(49.99));
        request.setQuantity(1);

        when(cartService.addToCart(any(CartItemRequest.class)))
                .thenReturn(cart(customer.getId()));

        mockMvc.perform(post("/api/cart/me/items")
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerId").value(customer.getId().toString()));

        var captor = forClass(CartItemRequest.class);
        verify(cartService).addToCart(captor.capture());
        assertThat(captor.getValue().getCustomerId()).isEqualTo(customer.getId());
    }

    @Test
    void clearMyCartUsesCurrentUser() throws Exception {
        mockMvc.perform(delete("/api/cart/me").principal(authentication))
                .andExpect(status().isNoContent());

        verify(cartService).clearCart(eq(customer.getId()));
    }

    private static CartResponse cart(UUID customerId) {
        CartResponse response = new CartResponse();
        response.setCustomerId(customerId);
        response.setTotalPrice(BigDecimal.valueOf(49.99));

        CartResponse.CartItemDto item = new CartResponse.CartItemDto();
        item.setId(UUID.randomUUID());
        item.setProductId(1L);
        item.setProductName("Mavazi Hoodie");
        item.setUnitPrice(BigDecimal.valueOf(49.99));
        item.setQuantity(1);
        item.setSubtotal(BigDecimal.valueOf(49.99));
        response.setItems(List.of(item));

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
