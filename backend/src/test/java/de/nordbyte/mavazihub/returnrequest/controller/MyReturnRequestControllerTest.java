package de.nordbyte.mavazihub.returnrequest.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.nordbyte.mavazihub.auth.security.model.CustomerUserDetails;
import de.nordbyte.mavazihub.returnrequest.dto.ReturnRequestCreateDTO;
import de.nordbyte.mavazihub.returnrequest.dto.ReturnRequestResponseDTO;
import de.nordbyte.mavazihub.returnrequest.service.ReturnRequestService;
import de.nordbyte.mavazihub.role.entity.Role;
import de.nordbyte.mavazihub.role.entity.RoleName;
import de.nordbyte.mavazihub.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class MyReturnRequestControllerTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private ReturnRequestService returnRequestService;
    private MockMvc mockMvc;
    private User customer;
    private UsernamePasswordAuthenticationToken authentication;

    @BeforeEach
    void setUp() {
        returnRequestService = mock(ReturnRequestService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new MyReturnRequestController(returnRequestService)).build();
        customer = customer(UUID.randomUUID());
        authentication = new UsernamePasswordAuthenticationToken(new CustomerUserDetails(customer), null);
    }

    @Test
    void requestReturnUsesOrderIdFromPathAndCurrentUser() throws Exception {
        UUID orderId = UUID.randomUUID();
        UUID orderItemId = UUID.randomUUID();
        ReturnRequestCreateDTO request = request(orderItemId, 1);
        ReturnRequestResponseDTO response = response(UUID.randomUUID(), orderId, orderItemId, 1);

        when(returnRequestService.requestReturn(eq(customer.getId()), any(ReturnRequestCreateDTO.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/me/orders/{orderId}/returns", orderId)
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").value(orderId.toString()))
                .andExpect(jsonPath("$.items[0].orderItemId").value(orderItemId.toString()));

        verify(returnRequestService).requestReturn(eq(customer.getId()), any(ReturnRequestCreateDTO.class));
    }

    @Test
    void getMyReturnsReturnsCurrentCustomersReturns() throws Exception {
        UUID returnId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        UUID orderItemId = UUID.randomUUID();

        when(returnRequestService.getMyReturns(customer.getId()))
                .thenReturn(List.of(response(returnId, orderId, orderItemId, 1)));

        mockMvc.perform(get("/api/me/returns").principal(authentication))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(returnId.toString()))
                .andExpect(jsonPath("$[0].status").value("REQUESTED"));
    }

    @Test
    void getMyReturnReturnsNotFoundWhenReturnIsNotOwned() throws Exception {
        UUID returnId = UUID.randomUUID();
        when(returnRequestService.getReturnById(returnId, customer.getId()))
                .thenReturn(Optional.empty());

        mockMvc.perform(get("/api/me/returns/{returnId}", returnId).principal(authentication))
                .andExpect(status().isNotFound());
    }

    private static ReturnRequestCreateDTO request(UUID orderItemId, int quantity) {
        ReturnRequestCreateDTO request = new ReturnRequestCreateDTO();
        request.setReason("Too small");
        ReturnRequestCreateDTO.ReturnItemDTO item = new ReturnRequestCreateDTO.ReturnItemDTO();
        item.setOrderItemId(orderItemId);
        item.setQuantity(quantity);
        request.setItems(List.of(item));
        return request;
    }

    private static ReturnRequestResponseDTO response(UUID returnId, UUID orderId, UUID orderItemId, int quantity) {
        ReturnRequestResponseDTO response = new ReturnRequestResponseDTO();
        response.setId(returnId);
        response.setOrderId(orderId);
        response.setReason("Too small");
        response.setStatus("REQUESTED");
        response.setCreatedAt(LocalDateTime.now());

        ReturnRequestResponseDTO.ReturnItemResponseDTO item = new ReturnRequestResponseDTO.ReturnItemResponseDTO();
        item.setOrderItemId(orderItemId);
        item.setQuantity(quantity);
        response.setItems(List.of(item));
        return response;
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
