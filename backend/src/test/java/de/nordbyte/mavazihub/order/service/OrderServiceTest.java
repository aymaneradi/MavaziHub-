package de.nordbyte.mavazihub.order.service;

import de.nordbyte.mavazihub.cart.repository.CartItemRepository;
import de.nordbyte.mavazihub.common.exception.BusinessException;
import de.nordbyte.mavazihub.order.entity.Order;
import de.nordbyte.mavazihub.order.repository.OrderRepository;
import de.nordbyte.mavazihub.product.service.ProductService;
import de.nordbyte.mavazihub.product.service.ProductVariantService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductService productService;

    @Mock
    private ProductVariantService productVariantService;

    @InjectMocks
    private OrderService orderService;

    @Test
    void updateOrderStatusAcceptsKnownStatus() {
        UUID orderId = UUID.randomUUID();
        Order order = new Order();
        order.setId(orderId);
        order.setStatus("PAID");

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertThat(orderService.updateOrderStatus(orderId, " shipped ").getStatus())
                .isEqualTo("SHIPPED");
    }

    @Test
    void updateOrderStatusRejectsUnknownStatus() {
        UUID orderId = UUID.randomUUID();
        Order order = new Order();
        order.setId(orderId);
        order.setStatus("PAID");

        when(orderRepository.findById(orderId)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.updateOrderStatus(orderId, "DONE"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Unbekannter Bestellstatus");
    }
}
