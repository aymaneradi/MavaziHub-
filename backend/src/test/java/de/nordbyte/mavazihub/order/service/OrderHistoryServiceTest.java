package de.nordbyte.mavazihub.order.service;

import de.nordbyte.mavazihub.order.dto.OrderDetailResponse;
import de.nordbyte.mavazihub.order.dto.OrderItemResponse;
import de.nordbyte.mavazihub.order.dto.OrderSummaryResponse;
import de.nordbyte.mavazihub.order.entity.Order;
import de.nordbyte.mavazihub.order.entity.OrderItem;
import de.nordbyte.mavazihub.order.repository.OrderRepository;
import de.nordbyte.mavazihub.returnrequest.repository.ReturnItemRepository;
import de.nordbyte.mavazihub.user.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderHistoryServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ReturnItemRepository returnItemRepository;

    @InjectMocks
    private OrderHistoryService orderHistoryService;

    @Test
    void getOrderHistoryReturnsOnlyOrdersForCurrentCustomer() {
        User customer = customer(UUID.randomUUID());
        Order order = order(customer.getId(), UUID.randomUUID(), 2);

        when(orderRepository.findByCustomerIdOrderByOrderDateDesc(customer.getId()))
                .thenReturn(List.of(order));

        List<OrderSummaryResponse> result = orderHistoryService.getOrderHistory(customer);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(order.getId());
        assertThat(result.get(0).status()).isEqualTo("PAID");
        assertThat(result.get(0).paymentStatus()).isEqualTo("PAID");
    }

    @Test
    void getOrderDetailsReturnsItemsAndRemainingReturnQuantity() {
        User customer = customer(UUID.randomUUID());
        UUID orderItemId = UUID.randomUUID();
        Order order = order(customer.getId(), orderItemId, 3);

        when(orderRepository.findByIdAndCustomerId(order.getId(), customer.getId()))
                .thenReturn(Optional.of(order));
        when(returnItemRepository.sumReturnedQuantityByOrderItemId(orderItemId))
                .thenReturn(1);

        OrderDetailResponse result = orderHistoryService.getOrderDetails(order.getId(), customer);

        assertThat(result.id()).isEqualTo(order.getId());
        assertThat(result.customerId()).isEqualTo(customer.getId());
        assertThat(result.items()).hasSize(1);
        assertThat(result.items().get(0).quantity()).isEqualTo(3);
        assertThat(result.items().get(0).returnableQuantity()).isEqualTo(2);
    }

    @Test
    void getReturnableItemsFiltersFullyReturnedItems() {
        User customer = customer(UUID.randomUUID());
        UUID returnableItemId = UUID.randomUUID();
        UUID fullyReturnedItemId = UUID.randomUUID();
        Order order = order(customer.getId(), returnableItemId, 2);
        order.getItems().add(orderItem(order, fullyReturnedItemId, 1));

        when(orderRepository.findByIdAndCustomerId(order.getId(), customer.getId()))
                .thenReturn(Optional.of(order));
        when(returnItemRepository.sumReturnedQuantityByOrderItemId(returnableItemId))
                .thenReturn(1);
        when(returnItemRepository.sumReturnedQuantityByOrderItemId(fullyReturnedItemId))
                .thenReturn(1);

        List<OrderItemResponse> result = orderHistoryService.getReturnableItems(order.getId(), customer);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(returnableItemId);
        assertThat(result.get(0).returnableQuantity()).isEqualTo(1);
    }

    @Test
    void getOrderDetailsThrowsNotFoundWhenOrderDoesNotBelongToCustomer() {
        User customer = customer(UUID.randomUUID());
        UUID orderId = UUID.randomUUID();

        when(orderRepository.findByIdAndCustomerId(orderId, customer.getId()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderHistoryService.getOrderDetails(orderId, customer))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404 NOT_FOUND");
    }

    private static User customer(UUID customerId) {
        User user = new User();
        user.setId(customerId);
        user.setEmail("customer@test.de");
        return user;
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
        order.getItems().add(orderItem(order, orderItemId, quantity));
        return order;
    }

    private static OrderItem orderItem(Order order, UUID orderItemId, int quantity) {
        OrderItem item = new OrderItem();
        item.setId(orderItemId);
        item.setOrder(order);
        item.setProductId(UUID.randomUUID());
        item.setProductName("Mavazi Hoodie");
        item.setUnitPrice(BigDecimal.valueOf(49.99));
        item.setQuantity(quantity);
        return item;
    }
}
