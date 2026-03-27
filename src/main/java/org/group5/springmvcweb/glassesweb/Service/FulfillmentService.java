package org.group5.springmvcweb.glassesweb.Service;

import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Entity.*;
import org.group5.springmvcweb.glassesweb.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FulfillmentService {

    @Autowired private OrderRepository orderRepository;
    @Autowired private ManufacturingOrderRepository manufacturingOrderRepository;
    @Autowired private ShipmentRepository shipmentRepository;
    @Autowired private AccountRepository accountRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private OrderItemRepository orderItemRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private InventoryReceiptRepository inventoryReceiptRepository;
    @Autowired private ReadyMadeGlassesRepository readyMadeGlassesRepository;
    @Autowired private ContactLensRepository contactLensRepository;
    @Autowired private FrameRepository frameRepository;
    @Autowired private LensRepository lensRepository;

    // ===== STAFF: Xác nhận đơn hàng =====
    @Transactional
    public void confirmOrder(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found!"));
        if (!"PENDING".equals(order.getStatus()))
            throw new RuntimeException("Order is not PENDING!");
        order.setStatus("CONFIRMED");
        orderRepository.save(order);

        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
        orderItems.forEach(item -> {
            // Tạo phiếu xuất kho
            InventoryReceipt receipt = new InventoryReceipt();
            receipt.setReceiptType("EXPORT");
            receipt.setProductType(item.getProductType());
            receipt.setProductId(item.getProductId());
            receipt.setQuantity(item.getQuantity());
            receipt.setNote("Auto export - Order #" + orderId);
            receipt.setCreatedBy(1);
            inventoryReceiptRepository.save(receipt);

            // ✅ Trừ stock thật sự
            deductStock(item.getProductType(), item.getProductId(), item.getQuantity());
        });
    }

    // ===== STAFF: Assign OPERATION sản xuất =====
    @Transactional
    public void assignOperation(Integer orderId, Integer accountId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found!"));
        if (!"CONFIRMED".equals(order.getStatus()))
            throw new RuntimeException("Order is not CONFIRMED!");
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found!"));
        if (!"OPERATION".equals(account.getRole()))
            throw new RuntimeException("Account is not OPERATION!");

        ManufacturingOrder manufacturingOrder = new ManufacturingOrder();
        manufacturingOrder.setOrderId(orderId);
        manufacturingOrder.setAssignedTo(accountId);
        manufacturingOrderRepository.save(manufacturingOrder);

        order.setStatus("MANUFACTURING");
        orderRepository.save(order);
    }

    // ===== OPERATION: Cập nhật trạng thái sản xuất =====
    @Transactional
    public void updateManufacturingStatus(String username, Integer orderId, String status) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found!"));
        ManufacturingOrder manufacturingOrder = manufacturingOrderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Manufacturing order not found!"));
        if (!manufacturingOrder.getAssignedTo().equals(account.getAccountId()))
            throw new RuntimeException("You are not assigned to this order!");

        List<String> validStatuses = List.of("IN_PROGRESS", "COMPLETED");
        if (!validStatuses.contains(status))
            throw new RuntimeException("Status not valid!");

        manufacturingOrder.setStatus(status);
        manufacturingOrderRepository.save(manufacturingOrder);

        if ("COMPLETED".equals(status)) {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found!"));
            order.setStatus("SHIPPING");
            orderRepository.save(order);
        }
    }

    // ===== STAFF: Assign SHIPPER giao hàng =====
    @Transactional
    public void assignShipper(Integer orderId, Integer shipperId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found!"));
        if (!"SHIPPING".equals(order.getStatus()))
            throw new RuntimeException("Order is not ready for shipping!");
        Account account = accountRepository.findById(shipperId)
                .orElseThrow(() -> new RuntimeException("Account not found!"));
        if (!"SHIPPER".equals(account.getRole()))
            throw new RuntimeException("Account is not SHIPPER!");

        boolean alreadyAssigned = shipmentRepository.findByOrderId(orderId).isPresent();
        if (alreadyAssigned) throw new RuntimeException("Order already has a shipper assigned!");

        Shipment shipment = new Shipment();
        shipment.setOrderId(orderId);
        shipment.setShipperId(shipperId);
        shipment.setShippedDate(LocalDateTime.now());
        shipmentRepository.save(shipment);
    }

    // ===== SHIPPER: Cập nhật trạng thái giao hàng =====
    @Transactional
    public void updateDeliveryStatus(String username, Integer orderId, String status) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found!"));
        Shipment shipment = shipmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Shipment not found!"));
        if (!shipment.getShipperId().equals(account.getAccountId()))
            throw new RuntimeException("You are not assigned to this shipment!");

        List<String> validStatuses = List.of("SHIPPING", "DELIVERED", "FAILED");
        if (!validStatuses.contains(status))
            throw new RuntimeException("Status not valid!");

        shipment.setDeliveryStatus(status);
        shipmentRepository.save(shipment);

        if ("DELIVERED".equals(status)) {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found!"));
            order.setStatus("DELIVERED");
            orderRepository.save(order);

            paymentRepository.findByOrderId(orderId).ifPresent(payment -> {
                if ("PENDING".equals(payment.getPaymentStatus())) {
                    payment.setPaymentStatus("PAID");
                    payment.setPaidDate(LocalDateTime.now());
                    payment.setTransactionId("COD-" + System.currentTimeMillis());
                    paymentRepository.save(payment);
                }
            });
        }
    }

    // ===== SHIPPER: Báo giao thất bại =====
    @Transactional
    public void handleFailedDelivery(String username, Integer orderId) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found!"));
        Shipment shipment = shipmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Shipment not found!"));
        if (!shipment.getShipperId().equals(account.getAccountId()))
            throw new RuntimeException("You are not assigned to this shipment!");

        shipment.setDeliveryStatus("FAILED");
        shipmentRepository.save(shipment);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found!"));
        order.setStatus("RETURN_PENDING");
        orderRepository.save(order);
    }

    // ===== STAFF: Xử lý hoàn hàng =====
    @Transactional
    public void handleReturnOrder(String username, Integer orderId) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found!"));
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found!"));
        if (!"RETURN_PENDING".equals(order.getStatus()))
            throw new RuntimeException("Order is not in RETURN_PENDING status!");

        order.setStatus("CANCELLED");
        orderRepository.save(order);

        paymentRepository.findByOrderId(orderId).ifPresent(payment -> {
            payment.setPaymentStatus("REFUNDED");
            paymentRepository.save(payment);
        });

        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
        orderItems.forEach(item -> {
            // Tạo phiếu nhập kho
            InventoryReceipt receipt = new InventoryReceipt();
            receipt.setReceiptType("IMPORT");
            receipt.setProductType(item.getProductType());
            receipt.setProductId(item.getProductId());
            receipt.setQuantity(item.getQuantity());
            receipt.setNote("Return from failed delivery - Order #" + orderId);
            receipt.setCreatedBy(account.getAccountId());
            inventoryReceiptRepository.save(receipt);

            // ✅ Cộng stock lại
            restoreStock(item.getProductType(), item.getProductId(), item.getQuantity());
        });
    }

    // ===== Xem Shipment =====
    public ShipmentResponse getShipment(Integer orderId) {
        Shipment shipment = shipmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Shipment not found!"));
        return new ShipmentResponse(shipment.getShipmentId(), shipment.getOrderId(),
                shipment.getCarrier(), shipment.getTrackingNumber(),
                shipment.getShippedDate(), shipment.getDeliveryStatus());
    }

    // ===== OPERATION: Lấy danh sách đơn được giao =====
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyManufacturingOrders(String username) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found!"));

        List<ManufacturingOrder> mfgOrders = manufacturingOrderRepository
                .findByAssignedTo(account.getAccountId());

        return mfgOrders.stream().map(mfg -> {
            Order order = orderRepository.findById(mfg.getOrderId()).orElse(null);
            if (order == null) return null;

            List<OrderItem> orderItems = orderItemRepository.findByOrderId(order.getOrderId());
            Payment payment = paymentRepository.findByOrderId(order.getOrderId()).orElse(null);
            String customerName = customerRepository.findById(order.getCustomerId())
                    .map(c -> c.getName()).orElse("KH #" + order.getCustomerId());
            boolean shipperAssigned = shipmentRepository.findByOrderId(order.getOrderId()).isPresent();

            List<CartItemResponse> itemResponses = orderItems.stream()
                    .map(item -> new CartItemResponse(item.getOrderItemId(), item.getProductType(),
                            item.getProductId(),
                            item.getProductSnapshot() != null ? item.getProductSnapshot() : "Unknown",
                            item.getQuantity(), item.getPrice()))
                    .collect(Collectors.toList());

            return new OrderResponse(order.getOrderId(), order.getStatus(), order.getShippingAddress(),
                    order.getOrderDate(), order.getTotalAmount(), order.getDiscountAmount(),
                    order.getFinalAmount(), order.getDiscountCode(),
                    payment != null ? payment.getPaymentMethod() : null,
                    payment != null ? payment.getPaymentStatus() : null,
                    mfg.getStatus(), customerName, shipperAssigned, itemResponses);
        }).filter(r -> r != null).collect(Collectors.toList());
    }

    // ===== SHIPPER: Lấy danh sách đơn được phân công =====
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyShipmentOrders(String username) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found!"));

        List<Shipment> shipments = shipmentRepository.findByShipperId(account.getAccountId());

        return shipments.stream().map(shipment -> {
            Order order = orderRepository.findById(shipment.getOrderId()).orElse(null);
            if (order == null) return null;

            List<OrderItem> orderItems = orderItemRepository.findByOrderId(order.getOrderId());
            Payment payment = paymentRepository.findByOrderId(order.getOrderId()).orElse(null);
            String customerName = customerRepository.findById(order.getCustomerId())
                    .map(c -> c.getName()).orElse("KH #" + order.getCustomerId());

            List<CartItemResponse> itemResponses = orderItems.stream()
                    .map(item -> new CartItemResponse(item.getOrderItemId(), item.getProductType(),
                            item.getProductId(),
                            item.getProductSnapshot() != null ? item.getProductSnapshot() : "Unknown",
                            item.getQuantity(), item.getPrice()))
                    .collect(Collectors.toList());

            return new OrderResponse(order.getOrderId(), order.getStatus(), order.getShippingAddress(),
                    order.getOrderDate(), order.getTotalAmount(), order.getDiscountAmount(),
                    order.getFinalAmount(), order.getDiscountCode(),
                    payment != null ? payment.getPaymentMethod() : null,
                    payment != null ? payment.getPaymentStatus() : null,
                    shipment.getDeliveryStatus(), customerName, true, itemResponses);
        }).filter(r -> r != null).collect(Collectors.toList());
    }

    // ===== Helper: Trừ stock =====
    private void deductStock(String productType, Integer productId, Integer quantity) {
        switch (productType) {
            case "READY_MADE" -> readyMadeGlassesRepository.findById(productId).ifPresent(p -> {
                p.setStock(Math.max(0, (p.getStock() != null ? p.getStock() : 0) - quantity));
                readyMadeGlassesRepository.save(p);
            });
            case "CONTACT_LENS" -> contactLensRepository.findById(productId).ifPresent(p -> {
                p.setStock(Math.max(0, (p.getStock() != null ? p.getStock() : 0) - quantity));
                contactLensRepository.save(p);
            });
            case "FRAME" -> frameRepository.findById(productId).ifPresent(p -> {
                p.setStock(Math.max(0, (p.getStock() != null ? p.getStock() : 0) - quantity));
                frameRepository.save(p);
            });
            case "LENS" -> lensRepository.findById(productId).ifPresent(p -> {
                p.setStock(Math.max(0, (p.getStock() != null ? p.getStock() : 0) - quantity));
                lensRepository.save(p);
            });
        }
    }

    // ===== Helper: Cộng stock lại =====
    private void restoreStock(String productType, Integer productId, Integer quantity) {
        switch (productType) {
            case "READY_MADE" -> readyMadeGlassesRepository.findById(productId).ifPresent(p -> {
                p.setStock((p.getStock() != null ? p.getStock() : 0) + quantity);
                readyMadeGlassesRepository.save(p);
            });
            case "CONTACT_LENS" -> contactLensRepository.findById(productId).ifPresent(p -> {
                p.setStock((p.getStock() != null ? p.getStock() : 0) + quantity);
                contactLensRepository.save(p);
            });
            case "FRAME" -> frameRepository.findById(productId).ifPresent(p -> {
                p.setStock((p.getStock() != null ? p.getStock() : 0) + quantity);
                frameRepository.save(p);
            });
            case "LENS" -> lensRepository.findById(productId).ifPresent(p -> {
                p.setStock((p.getStock() != null ? p.getStock() : 0) + quantity);
                lensRepository.save(p);
            });
        }
    }
}