package de.nordbyte.mavazihub.order.service;

import de.nordbyte.mavazihub.order.dto.OrderDetailResponse;
import de.nordbyte.mavazihub.order.dto.OrderItemResponse;
import de.nordbyte.mavazihub.order.dto.OrderSummaryResponse;
import de.nordbyte.mavazihub.order.entity.Order;
import de.nordbyte.mavazihub.order.entity.OrderItem;
import de.nordbyte.mavazihub.order.repository.OrderRepository;
import de.nordbyte.mavazihub.returnrequest.repository.ReturnItemRepository;
import de.nordbyte.mavazihub.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderHistoryService {
    private final OrderRepository orderRepository;
    private final ReturnItemRepository returnItemRepository;

    public List<OrderSummaryResponse> getOrderHistory(User customer) {
        return orderRepository.findByCustomerIdOrderByOrderDateDesc(customer.getId())
                .stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    public OrderDetailResponse getOrderDetails(UUID orderId, User customer) {
        Order order = findOwnedOrder(orderId, customer);
        return toDetailResponse(order);
    }

    public List<OrderItemResponse> getReturnableItems(UUID orderId, User customer) {
        return findOwnedOrder(orderId, customer).getItems()
                .stream()
                .map(this::toItemResponse)
                .filter(item -> item.returnableQuantity() > 0)
                .toList();
    }

    public Order findOwnedOrder(UUID orderId, User customer) {
        return orderRepository.findByIdAndCustomerId(orderId, customer.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Order not found"
                ));
    }

    private OrderSummaryResponse toSummaryResponse(Order order) {
        return new OrderSummaryResponse(
                order.getId(),
                order.getStatus(),
                order.getPaymentStatus(),
                order.getTotalPrice(),
                order.getOrderDate()
        );
    }

    private OrderDetailResponse toDetailResponse(Order order) {
        return new OrderDetailResponse(
                order.getId(),
                order.getCustomerId(),
                order.getStatus(),
                order.getPaymentStatus(),
                order.getTotalPrice(),
                order.getStreet(),
                order.getZipCode(),
                order.getCity(),
                order.getOrderDate(),
                order.getItems()
                        .stream()
                        .map(this::toItemResponse)
                        .toList()
        );
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        int activeReturnQuantity = returnItemRepository.sumReturnedQuantityByOrderItemId(item.getId());
        int returnableQuantity = Math.max(0, item.getQuantity() - activeReturnQuantity);

        return new OrderItemResponse(
                item.getId(),
                item.getProductId(),
                item.getProductName(),
                item.getUnitPrice(),
                item.getQuantity(),
                returnableQuantity
        );
    }
}
