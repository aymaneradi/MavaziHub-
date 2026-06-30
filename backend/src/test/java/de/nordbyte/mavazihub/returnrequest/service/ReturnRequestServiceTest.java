package de.nordbyte.mavazihub.returnrequest.service;

import de.nordbyte.mavazihub.order.entity.Order;
import de.nordbyte.mavazihub.order.entity.OrderItem;
import de.nordbyte.mavazihub.order.repository.OrderRepository;
import de.nordbyte.mavazihub.returnrequest.dto.ReturnRequestCreateDTO;
import de.nordbyte.mavazihub.returnrequest.dto.ReturnRequestResponseDTO;
import de.nordbyte.mavazihub.returnrequest.entity.ReturnRequest;
import de.nordbyte.mavazihub.returnrequest.repository.ReturnItemRepository;
import de.nordbyte.mavazihub.returnrequest.repository.ReturnRequestRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReturnRequestServiceTest {

    @Mock
    private ReturnRequestRepository returnRequestRepository;

    @Mock
    private ReturnItemRepository returnItemRepository;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private ReturnRequestService returnRequestService;

    @Test
    void requestReturnStoresReturnForOwnedOrder() {
        UUID customerId = UUID.randomUUID();
        UUID orderItemId = UUID.randomUUID();
        Order order = order(customerId, orderItemId, 2);
        ReturnRequestCreateDTO request = request(order.getId(), orderItemId, 1, "Too small");

        when(orderRepository.findById(order.getId())).thenReturn(Optional.of(order));
        when(returnItemRepository.sumReturnedQuantityByOrderItemId(orderItemId)).thenReturn(0);
        when(returnRequestRepository.save(any(ReturnRequest.class))).thenAnswer(invocation -> {
            ReturnRequest saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            saved.setCreatedAt(LocalDateTime.now());
            return saved;
        });

        ReturnRequestResponseDTO result = returnRequestService.requestReturn(customerId, request);

        ArgumentCaptor<ReturnRequest> captor = ArgumentCaptor.forClass(ReturnRequest.class);
        verify(returnRequestRepository).save(captor.capture());
        ReturnRequest saved = captor.getValue();

        assertThat(saved.getOrderId()).isEqualTo(order.getId());
        assertThat(saved.getCustomerId()).isEqualTo(customerId);
        assertThat(saved.getReason()).isEqualTo("Too small");
        assertThat(saved.getStatus()).isEqualTo("REQUESTED");
        assertThat(saved.getItems()).hasSize(1);
        assertThat(saved.getItems().get(0).getOrderItemId()).isEqualTo(orderItemId);
        assertThat(saved.getItems().get(0).getQuantity()).isEqualTo(1);
        assertThat(result.getStatus()).isEqualTo("REQUESTED");
    }

    @Test
    void requestReturnAllowsRemainingQuantityAfterPartialReturn() {
        UUID customerId = UUID.randomUUID();
        UUID orderItemId = UUID.randomUUID();
        Order order = order(customerId, orderItemId, 2);
        ReturnRequestCreateDTO request = request(order.getId(), orderItemId, 1, "Second partial return");

        when(orderRepository.findById(order.getId())).thenReturn(Optional.of(order));
        when(returnItemRepository.sumReturnedQuantityByOrderItemId(orderItemId)).thenReturn(1);
        when(returnRequestRepository.save(any(ReturnRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReturnRequestResponseDTO result = returnRequestService.requestReturn(customerId, request);

        assertThat(result.getItems()).hasSize(1);
        assertThat(result.getItems().get(0).getQuantity()).isEqualTo(1);
    }

    @Test
    void requestReturnRejectsQuantityAboveRemainingReturnableQuantity() {
        UUID customerId = UUID.randomUUID();
        UUID orderItemId = UUID.randomUUID();
        Order order = order(customerId, orderItemId, 2);
        ReturnRequestCreateDTO request = request(order.getId(), orderItemId, 2, "Too many");

        when(orderRepository.findById(order.getId())).thenReturn(Optional.of(order));
        when(returnItemRepository.sumReturnedQuantityByOrderItemId(orderItemId)).thenReturn(1);

        assertThatThrownBy(() -> returnRequestService.requestReturn(customerId, request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Noch ruecksendbar: 1");
    }

    @Test
    void requestReturnRejectsOrderOwnedByAnotherCustomer() {
        UUID ownerId = UUID.randomUUID();
        UUID otherCustomerId = UUID.randomUUID();
        UUID orderItemId = UUID.randomUUID();
        Order order = order(ownerId, orderItemId, 1);
        ReturnRequestCreateDTO request = request(order.getId(), orderItemId, 1, "Wrong customer");

        when(orderRepository.findById(order.getId())).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> returnRequestService.requestReturn(otherCustomerId, request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("nur fuer eigene Bestellungen");
    }

    @Test
    void getReturnByIdReturnsOnlyOwnedReturnRequest() {
        UUID customerId = UUID.randomUUID();
        ReturnRequest returnRequest = new ReturnRequest();
        returnRequest.setId(UUID.randomUUID());
        returnRequest.setCustomerId(customerId);
        returnRequest.setOrderId(UUID.randomUUID());
        returnRequest.setStatus("REQUESTED");
        returnRequest.setCreatedAt(LocalDateTime.now());

        when(returnRequestRepository.findById(returnRequest.getId()))
                .thenReturn(Optional.of(returnRequest));

        assertThat(returnRequestService.getReturnById(returnRequest.getId(), customerId)).isPresent();
        assertThat(returnRequestService.getReturnById(returnRequest.getId(), UUID.randomUUID())).isEmpty();
    }

    private static ReturnRequestCreateDTO request(UUID orderId, UUID orderItemId, int quantity, String reason) {
        ReturnRequestCreateDTO request = new ReturnRequestCreateDTO();
        request.setOrderId(orderId);
        request.setReason(reason);

        ReturnRequestCreateDTO.ReturnItemDTO item = new ReturnRequestCreateDTO.ReturnItemDTO();
        item.setOrderItemId(orderItemId);
        item.setQuantity(quantity);
        request.setItems(List.of(item));
        return request;
    }

    private static Order order(UUID customerId, UUID orderItemId, int quantity) {
        Order order = new Order();
        order.setId(UUID.randomUUID());
        order.setCustomerId(customerId);
        order.setStatus("PAID");
        order.setPaymentStatus("PAID");
        order.setStreet("Test Street 1");
        order.setZipCode("12345");
        order.setCity("Berlin");
        order.setTotalPrice(BigDecimal.valueOf(99.99));
        order.setOrderDate(LocalDateTime.now());

        OrderItem item = new OrderItem();
        item.setId(orderItemId);
        item.setOrder(order);
        item.setProductId(UUID.randomUUID());
        item.setProductName("Mavazi Hoodie");
        item.setUnitPrice(BigDecimal.valueOf(49.99));
        item.setQuantity(quantity);
        order.getItems().add(item);
        return order;
    }
}
