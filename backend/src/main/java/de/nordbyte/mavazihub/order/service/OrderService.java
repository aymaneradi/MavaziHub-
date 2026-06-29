package de.nordbyte.mavazihub.order.service;

import de.nordbyte.mavazihub.cart.entity.CartItem;
import de.nordbyte.mavazihub.cart.repository.CartItemRepository;
import de.nordbyte.mavazihub.order.dto.OrderRequest;
import de.nordbyte.mavazihub.order.dto.OrderResponse;
import de.nordbyte.mavazihub.order.entity.Order;
import de.nordbyte.mavazihub.order.entity.OrderItem;
import de.nordbyte.mavazihub.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
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

    @Transactional
    public OrderResponse processOrder(OrderRequest request) {

        UUID customerId = request.getCustomerId();

        // SCHRITT 1: Warenkorb laden
        List<CartItem> cartItems = cartItemRepository.findByCustomerId(customerId);

        // SCHRITT 2: Warenkorb prüfen
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Warenkorb von Kunde " + customerId + " ist leer.");
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
            item.setProductName(cartItem.getProductName());
            item.setUnitPrice(cartItem.getUnitPrice());
            item.setQuantity(cartItem.getQuantity());

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

}
