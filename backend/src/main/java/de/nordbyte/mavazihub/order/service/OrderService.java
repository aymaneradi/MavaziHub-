package de.nordbyte.mavazihub.order.service;

import de.nordbyte.mavazihub.cart.entity.CartItem;
import de.nordbyte.mavazihub.cart.repository.CartItemRepository;
import de.nordbyte.mavazihub.common.exception.BusinessException;
import de.nordbyte.mavazihub.common.exception.ResourceNotFoundException;
import de.nordbyte.mavazihub.order.dto.OrderRequest;
import de.nordbyte.mavazihub.order.dto.OrderResponse;
import de.nordbyte.mavazihub.order.entity.Order;
import de.nordbyte.mavazihub.order.entity.OrderItem;
import de.nordbyte.mavazihub.order.repository.OrderRepository;
import de.nordbyte.mavazihub.product.service.ProductService;
import de.nordbyte.mavazihub.product.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository    orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductService productService;
    private final ProductVariantService productVariantService;

    @Transactional
    public OrderResponse processOrder(UUID customerId, OrderRequest request) {

        // SCHRITT 1: Warenkorb laden
        List<CartItem> cartItems = cartItemRepository.findByCustomerId(customerId);

        // SCHRITT 2: Warenkorb prüfen
        if (cartItems.isEmpty()) {
            throw new BusinessException("Warenkorb ist leer.");
        }

        // SCHRITT 3: Order erstellen
        Order order = new Order();
        order.setCustomerId(customerId);
        order.setStatus("PROCESSING");
        order.setStreet(request.getStreet());
        order.setZipCode(request.getZipCode());
        order.setCity(request.getCity());
        order.setOrderDate(LocalDateTime.now());

        // Sicherstellen, dass die Liste im Entity initialisiert ist, falls nicht im Konstruktor geschehen
        if (order.getItems() == null) {
            order.setItems(new ArrayList<>());
        }

        // SCHRITT 4: OrderItems aus CartItems erstellen (Snapshot ADR-05)
        BigDecimal total = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            OrderItem item = new OrderItem();
            item.setOrder(order); // Wichtig für JPA Fremdschlüssel-Mapping!
            item.setProductId(cartItem.getProductId());
            item.setVariantId(cartItem.getVariantId());
            item.setProductName(cartItem.getProductName());
            item.setUnitPrice(cartItem.getUnitPrice());
            item.setQuantity(cartItem.getQuantity());

            reduceStock(cartItem);

            order.getItems().add(item);

            total = total.add(
                    cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()))
            );
        }

        order.setTotalPrice(total);

        // SCHRITT 5: Zahlungsstatus simulieren (V1.0)
        order.setStatus("PAID"); // Status-Update auf bezahlt wechseln, wenn Simulation erfolgreich
        order.setPaymentStatus("SIMULATED_PAID");

        // Speichern (Kaskadiert automatisch in order_items dank CascadeType.ALL)
        Order saved = orderRepository.save(order);

        // SCHRITT 6: Warenkorb leeren
        cartItemRepository.deleteByCustomerId(customerId);

        return toResponse(saved);
    }

    @Transactional(readOnly = true) // Performance-Optimierung für Lesezugriffe
    public Optional<OrderResponse> getOrderById(UUID id) {
        return orderRepository.findById(id).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "orderDate"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public OrderResponse updateOrderStatus(UUID id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bestellung nicht gefunden mit ID: " + id));

        order.setStatus(status.trim().toUpperCase());
        return toResponse(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public Optional<OrderResponse> getOrderById(UUID id, UUID customerId) {
        return orderRepository.findByIdAndCustomerId(id, customerId).map(this::toResponse);
    }

    private OrderResponse toResponse(Order order) {
        OrderResponse res = new OrderResponse();
        res.setId(order.getId());
        res.setStatus(order.getStatus());
        res.setPaymentStatus(order.getPaymentStatus());
        res.setTotalPrice(order.getTotalPrice());
        res.setOrderDate(order.getOrderDate());

        // Null-Safe-Check für Items
        if (order.getItems() != null) {
            List<OrderResponse.ItemDto> items = order.getItems().stream().map(i -> {
                OrderResponse.ItemDto dto = new OrderResponse.ItemDto();
                dto.setId(i.getId());
                dto.setProductId(i.getProductId());
                dto.setVariantId(i.getVariantId());
                dto.setProductName(i.getProductName());
                dto.setUnitPrice(i.getUnitPrice());
                dto.setQuantity(i.getQuantity());
                return dto;
            }).toList();
            res.setItems(items);
        }

        return res;
    }


    /**
     * Bestellhistorie eines Kunden abrufen (UC-BH-01, GET /api/orders/my).
     * Sortiert nach Datum absteigend (neueste zuerst).
     */
    public List<OrderResponse> getMyOrders(UUID customerId) {
        List<Order> orders = orderRepository.findByCustomerIdOrderByOrderDateDesc(customerId);
        return orders.stream()
                .map(this::toResponse)
                .toList();
    }

    private void reduceStock(CartItem cartItem) {
        if (cartItem.getVariantId() != null) {
            productVariantService.reduceStock(
                    cartItem.getProductId(),
                    cartItem.getVariantId(),
                    cartItem.getQuantity()
            );
            return;
        }

        productService.reduceStock(cartItem.getProductId(), cartItem.getQuantity());
    }

}
