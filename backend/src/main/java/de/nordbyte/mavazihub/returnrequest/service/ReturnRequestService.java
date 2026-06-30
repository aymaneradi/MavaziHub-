package de.nordbyte.mavazihub.returnrequest.service;

import de.nordbyte.mavazihub.order.entity.Order;
import de.nordbyte.mavazihub.order.entity.OrderItem;
import de.nordbyte.mavazihub.order.repository.OrderRepository;
import de.nordbyte.mavazihub.returnrequest.dto.ReturnRequestCreateDTO;
import de.nordbyte.mavazihub.returnrequest.dto.ReturnRequestResponseDTO;
import de.nordbyte.mavazihub.returnrequest.entity.ReturnItem;
import de.nordbyte.mavazihub.returnrequest.entity.ReturnRequest;
import de.nordbyte.mavazihub.returnrequest.repository.ReturnItemRepository;
import de.nordbyte.mavazihub.returnrequest.repository.ReturnRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReturnRequestService {

    private final ReturnRequestRepository returnRequestRepository;
    private final ReturnItemRepository returnItemRepository;
    private final OrderRepository orderRepository;

    /**
     * Creates a return request for an owned order (UC-RS-01).
     */
    @Transactional
    public ReturnRequestResponseDTO requestReturn(UUID customerId, ReturnRequestCreateDTO dto) {
        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new RuntimeException(
                        "Bestellung " + dto.getOrderId() + " wurde nicht gefunden."));

        if (!order.getCustomerId().equals(customerId)) {
            throw new RuntimeException(
                    "Ruecksendungen sind nur fuer eigene Bestellungen moeglich.");
        }

        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new RuntimeException(
                    "Es muss mindestens ein Artikel fuer die Ruecksendung ausgewaehlt werden.");
        }

        Map<UUID, OrderItem> orderItemsById = order.getItems().stream()
                .collect(Collectors.toMap(OrderItem::getId, oi -> oi));
        Map<UUID, Integer> requestedQuantities = new LinkedHashMap<>();

        for (ReturnRequestCreateDTO.ReturnItemDTO itemDto : dto.getItems()) {
            if (itemDto.getOrderItemId() == null) {
                throw new RuntimeException("Es muss ein Bestellartikel angegeben werden.");
            }

            OrderItem orderItem = orderItemsById.get(itemDto.getOrderItemId());
            if (orderItem == null) {
                throw new RuntimeException(
                        "Artikel " + itemDto.getOrderItemId() +
                                " gehoert nicht zu Bestellung " + dto.getOrderId() + ".");
            }

            if (itemDto.getQuantity() == null || itemDto.getQuantity() <= 0) {
                throw new RuntimeException(
                        "Ungueltige Ruecksendemenge fuer Artikel '" +
                                orderItem.getProductName() + "'. Angefordert: " + itemDto.getQuantity() + ".");
            }

            requestedQuantities.merge(itemDto.getOrderItemId(), itemDto.getQuantity(), Integer::sum);

            int alreadyReturned = returnItemRepository.sumReturnedQuantityByOrderItemId(itemDto.getOrderItemId());
            int requestedTotal = requestedQuantities.get(itemDto.getOrderItemId());
            int returnableQuantity = orderItem.getQuantity() - alreadyReturned;

            if (requestedTotal > returnableQuantity) {
                throw new RuntimeException(
                        "Ungueltige Ruecksendemenge fuer Artikel '" +
                                orderItem.getProductName() + "'. Noch ruecksendbar: " +
                                Math.max(0, returnableQuantity) + ", angefordert: " + requestedTotal + ".");
            }
        }

        ReturnRequest returnRequest = new ReturnRequest();
        returnRequest.setOrderId(order.getId());
        returnRequest.setCustomerId(customerId);
        returnRequest.setReason(dto.getReason());
        returnRequest.setStatus("REQUESTED");

        for (Map.Entry<UUID, Integer> requestedItem : requestedQuantities.entrySet()) {
            ReturnItem item = new ReturnItem();
            item.setReturnRequest(returnRequest);
            item.setOrderItemId(requestedItem.getKey());
            item.setQuantity(requestedItem.getValue());
            returnRequest.getItems().add(item);
        }

        ReturnRequest saved = returnRequestRepository.save(returnRequest);
        return toResponse(saved);
    }

    /**
     * Returns all return requests owned by a customer.
     */
    public List<ReturnRequestResponseDTO> getMyReturns(UUID customerId) {
        return returnRequestRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Returns one owned return request.
     */
    public Optional<ReturnRequestResponseDTO> getReturnById(UUID id, UUID customerId) {
        return returnRequestRepository.findById(id)
                .filter(r -> r.getCustomerId().equals(customerId))
                .map(this::toResponse);
    }

    private ReturnRequestResponseDTO toResponse(ReturnRequest entity) {
        ReturnRequestResponseDTO dto = new ReturnRequestResponseDTO();
        dto.setId(entity.getId());
        dto.setOrderId(entity.getOrderId());
        dto.setReason(entity.getReason());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());

        List<ReturnRequestResponseDTO.ReturnItemResponseDTO> items = entity.getItems().stream()
                .map(i -> {
                    ReturnRequestResponseDTO.ReturnItemResponseDTO itemDto =
                            new ReturnRequestResponseDTO.ReturnItemResponseDTO();
                    itemDto.setOrderItemId(i.getOrderItemId());
                    itemDto.setQuantity(i.getQuantity());
                    return itemDto;
                })
                .toList();

        dto.setItems(items);
        return dto;
    }
}
