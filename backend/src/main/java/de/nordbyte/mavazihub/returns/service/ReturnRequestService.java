package de.nordbyte.mavazihub.returns.service;

import de.nordbyte.mavazihub.order.entity.Order;
import de.nordbyte.mavazihub.order.entity.OrderItem;
import de.nordbyte.mavazihub.order.service.OrderHistoryService;
import de.nordbyte.mavazihub.returns.dto.*;
import de.nordbyte.mavazihub.returns.entity.ReturnRequest;
import de.nordbyte.mavazihub.returns.entity.ReturnRequestItem;
import de.nordbyte.mavazihub.returns.entity.ReturnRequestStatus;
import de.nordbyte.mavazihub.returns.repository.ReturnRequestItemRepository;
import de.nordbyte.mavazihub.returns.repository.ReturnRequestRepository;
import de.nordbyte.mavazihub.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ReturnRequestService {
    private final OrderHistoryService orderHistoryService;
    private final ReturnRequestRepository returnRequestRepository;
    private final ReturnRequestItemRepository returnRequestItemRepository;

    public ReturnRequestDetailResponse createReturnRequest(UUID orderId, User customer, CreateReturnRequest request) {
        Order order = orderHistoryService.findOwnedOrder(orderId, customer);
        validateUniqueOrderItems(request);

        ReturnRequest returnRequest = ReturnRequest.builder()
                .returnNumber(generateReturnNumber())
                .order(order)
                .customer(customer)
                .status(ReturnRequestStatus.REQUESTED)
                .reason(request.reason())
                .build();

        List<ReturnRequestItem> items = request.items()
                .stream()
                .map(itemRequest -> buildReturnItem(order, returnRequest, itemRequest))
                .toList();

        returnRequest.getItems().addAll(items);
        return toDetailResponse(returnRequestRepository.save(returnRequest));
    }

    public List<ReturnRequestSummaryResponse> getMyReturns(User customer) {
        return returnRequestRepository.findByCustomerOrderByCreatedAtDesc(customer)
                .stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    public ReturnRequestDetailResponse getMyReturn(UUID returnId, User customer) {
        ReturnRequest returnRequest = returnRequestRepository.findByIdAndCustomer(returnId, customer)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Return request not found"));

        return toDetailResponse(returnRequest);
    }

    public List<ReturnRequestSummaryResponse> getAllReturns() {
        return returnRequestRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    public ReturnRequestDetailResponse getReturn(UUID returnId) {
        return toDetailResponse(findReturnRequest(returnId));
    }

    public ReturnRequestDetailResponse updateReturnStatus(
            UUID returnId,
            User employee,
            UpdateReturnStatusRequest request
    ) {
        ReturnRequest returnRequest = findReturnRequest(returnId);
        returnRequest.setStatus(request.status());
        returnRequest.setStaffComment(request.staffComment());
        returnRequest.setProcessedBy(employee);
        returnRequest.setProcessedAt(LocalDateTime.now());

        return toDetailResponse(returnRequestRepository.save(returnRequest));
    }

    private ReturnRequestItem buildReturnItem(
            Order order,
            ReturnRequest returnRequest,
            CreateReturnItemRequest itemRequest
    ) {
        OrderItem orderItem = order.getItems()
                .stream()
                .filter(item -> item.getId().equals(itemRequest.orderItemId()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Order item does not belong to this order"
                ));

        int activeReturnQuantity = returnRequestItemRepository.sumActiveReturnQuantityByOrderItemId(orderItem.getId());
        int returnableQuantity = orderItem.getQuantity() - activeReturnQuantity;

        if (itemRequest.quantity() > returnableQuantity) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Return quantity exceeds returnable quantity"
            );
        }

        return ReturnRequestItem.builder()
                .returnRequest(returnRequest)
                .orderItem(orderItem)
                .quantity(itemRequest.quantity())
                .reason(itemRequest.reason())
                .build();
    }

    private void validateUniqueOrderItems(CreateReturnRequest request) {
        Set<UUID> orderItemIds = new HashSet<>();

        for (CreateReturnItemRequest item : request.items()) {
            if (!orderItemIds.add(item.orderItemId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Duplicate order item in return request"
                );
            }
        }
    }

    private ReturnRequest findReturnRequest(UUID returnId) {
        return returnRequestRepository.findById(returnId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Return request not found"));
    }

    private String generateReturnNumber() {
        return "RET-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private ReturnRequestSummaryResponse toSummaryResponse(ReturnRequest returnRequest) {
        return new ReturnRequestSummaryResponse(
                returnRequest.getId(),
                returnRequest.getReturnNumber(),
                returnRequest.getOrder().getId(),
                returnRequest.getOrder().getOrderNumber(),
                returnRequest.getStatus(),
                returnRequest.getReason(),
                returnRequest.getCreatedAt()
        );
    }

    private ReturnRequestDetailResponse toDetailResponse(ReturnRequest returnRequest) {
        return new ReturnRequestDetailResponse(
                returnRequest.getId(),
                returnRequest.getReturnNumber(),
                returnRequest.getOrder().getId(),
                returnRequest.getOrder().getOrderNumber(),
                returnRequest.getStatus(),
                returnRequest.getReason(),
                returnRequest.getStaffComment(),
                returnRequest.getProcessedAt(),
                returnRequest.getCreatedAt(),
                returnRequest.getUpdatedAt(),
                returnRequest.getItems()
                        .stream()
                        .map(this::toItemResponse)
                        .toList()
        );
    }

    private ReturnItemResponse toItemResponse(ReturnRequestItem item) {
        OrderItem orderItem = item.getOrderItem();

        return new ReturnItemResponse(
                item.getId(),
                orderItem.getId(),
                orderItem.getProductName(),
                orderItem.getVariantSize(),
                orderItem.getVariantColor(),
                orderItem.getUnitPrice(),
                item.getQuantity(),
                item.getReason()
        );
    }
}
