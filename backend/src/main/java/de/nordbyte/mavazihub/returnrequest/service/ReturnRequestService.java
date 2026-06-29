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
     * Rücksendung anfordern (UC-RS-01).
     *
     * Ablauf:
     *  1. Bestellung laden und prüfen, ob sie dem Kunden gehört
     *  2. Für jeden gewünschten Artikel: prüfen ob er in der Bestellung existiert
     *  3. Prüfen, dass Rücksendemenge <= bestellte Menge
     *  4. Prüfen, dass dieser Artikel nicht bereits zurückgesendet wurde
     *     (keine doppelten Rücksendeanfragen für denselben Artikel)
     *  5. ReturnRequest mit Status "REQUESTED" speichern
     */
    @Transactional
    public ReturnRequestResponseDTO requestReturn(UUID customerId, ReturnRequestCreateDTO dto) {

        // ── SCHRITT 1: Bestellung laden und Eigentümer prüfen (QA-09) ─────────
        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new RuntimeException(
                        "Bestellung " + dto.getOrderId() + " wurde nicht gefunden."));

        if (!order.getCustomerId().equals(customerId)) {
            throw new RuntimeException(
                    "Rücksendungen sind nur für eigene Bestellungen möglich.");
        }

        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new RuntimeException(
                    "Es muss mindestens ein Artikel für die Rücksendung ausgewählt werden.");
        }

        // Map: orderItemId -> OrderItem (für schnellen Zugriff)
        Map<UUID, OrderItem> orderItemsById = order.getItems().stream()
                .collect(Collectors.toMap(OrderItem::getId, oi -> oi));

        // ── SCHRITT 2-4: Validierung jedes angefragten Artikels ───────────────
        for (ReturnRequestCreateDTO.ReturnItemDTO itemDto : dto.getItems()) {

            OrderItem orderItem = orderItemsById.get(itemDto.getOrderItemId());

            // Artikel muss zur Bestellung gehören
            if (orderItem == null) {
                throw new RuntimeException(
                        "Artikel " + itemDto.getOrderItemId() +
                                " gehört nicht zu Bestellung " + dto.getOrderId() + ".");
            }

            // Rücksendemenge darf bestellte Menge nicht überschreiten
            if (itemDto.getQuantity() == null || itemDto.getQuantity() <= 0
                    || itemDto.getQuantity() > orderItem.getQuantity()) {
                throw new RuntimeException(
                        "Ungültige Rücksendemenge für Artikel '" +
                                orderItem.getProductName() + "'. Bestellt: " +
                                orderItem.getQuantity() + ", angefordert: " + itemDto.getQuantity() + ".");
            }

            // Doppelte Rücksendeanfragen für denselben Artikel verhindern
            List<ReturnItem> existing = returnItemRepository.findByOrderItemId(itemDto.getOrderItemId());
            if (!existing.isEmpty()) {
                throw new RuntimeException(
                        "Für Artikel '" + orderItem.getProductName() +
                                "' wurde bereits eine Rücksendung beantragt.");
            }
        }

        // ── SCHRITT 5: ReturnRequest erstellen und speichern ──────────────────
        ReturnRequest returnRequest = new ReturnRequest();
        returnRequest.setOrderId(order.getId());
        returnRequest.setCustomerId(customerId);
        returnRequest.setReason(dto.getReason());
        returnRequest.setStatus("REQUESTED");

        for (ReturnRequestCreateDTO.ReturnItemDTO itemDto : dto.getItems()) {
            ReturnItem item = new ReturnItem();
            item.setReturnRequest(returnRequest);
            item.setOrderItemId(itemDto.getOrderItemId());
            item.setQuantity(itemDto.getQuantity());
            returnRequest.getItems().add(item);
        }

        ReturnRequest saved = returnRequestRepository.save(returnRequest);
        return toResponse(saved);
    }

    /**
     * Eigene Rücksendeanfragen abrufen (GET /api/returns/my, QA-09).
     */
    public List<ReturnRequestResponseDTO> getMyReturns(UUID customerId) {
        return returnRequestRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }


    /**
     * Einzelne Rücksendeanfrage abrufen (GET /api/returns/{id}).
     * Eigentümerprüfung: Nur eigene Rücksendeanfragen abrufbar (QA-09).
     */
    public Optional<ReturnRequestResponseDTO> getReturnById(UUID id, UUID customerId) {
        return returnRequestRepository.findById(id)
                .filter(r -> r.getCustomerId().equals(customerId))
                .map(this::toResponse);
    }

    // ── Entity → DTO ──────────────────────────────────────────────────────────
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
