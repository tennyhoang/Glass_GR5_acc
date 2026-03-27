package org.group5.springmvcweb.glassesweb.Service;

import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

@Service
public class DashboardService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ReadyMadeGlassesRepository readyMadeGlassesRepository;

    @Autowired
    private ContactLensRepository contactLensRepository;

    @Autowired
    private FrameRepository frameRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private ManufacturingOrderRepository manufacturingOrderRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;
    // ===== ADMIN =====
    @Transactional(readOnly = true)
    public AdminDashboardResponse getAdminDashboard() {
        Long totalOrders = orderRepository.count();
        Long pendingOrders = orderRepository.countByStatus("PENDING");
        Long confirmedOrders = orderRepository.countByStatus("CONFIRMED");
        Long manufacturingOrders = orderRepository.countByStatus("MANUFACTURING");
        Long shippingOrders = orderRepository.countByStatus("SHIPPING");
        Long deliveredOrders = orderRepository.countByStatus("DELIVERED");
        Long cancelledOrders = orderRepository.countByStatus("CANCELLED");

        Double totalRevenue = paymentRepository.findAll().stream()
                .filter(p -> "PAID".equals(p.getPaymentStatus()))
                .mapToDouble(p -> p.getPaidAmount() != null
                        ? p.getPaidAmount() : 0.0)
                .sum();

        Long totalCustomers = customerRepository.count();
        Long totalProducts = readyMadeGlassesRepository.count()
                + contactLensRepository.count()
                + frameRepository.count();

        Long totalStaff = accountRepository.findAll().stream()
                .filter(a -> !"USER".equals(a.getRole()))
                .count();

        return new AdminDashboardResponse(
                totalOrders, pendingOrders, confirmedOrders,
                manufacturingOrders, shippingOrders,
                deliveredOrders, cancelledOrders,
                totalRevenue, totalCustomers,
                totalProducts, totalStaff
        );
    }

    // ===== STAFF =====
    @Transactional(readOnly = true)
    public StaffDashboardResponse getStaffDashboard() {
        Long pendingOrders = orderRepository.countByStatus("PENDING");
        Long confirmedOrders = orderRepository.countByStatus("CONFIRMED");
        Long manufacturingOrders = orderRepository.countByStatus("MANUFACTURING");
        Long shippingOrders = orderRepository.countByStatus("SHIPPING");
        Long returnPendingOrders = orderRepository.countByStatus("RETURN_PENDING");

        Long todayOrders = orderRepository.findAll().stream()
                .filter(o -> o.getOrderDate() != null
                        && o.getOrderDate().toLocalDate()
                        .equals(LocalDate.now()))
                .count();

        return new StaffDashboardResponse(
                pendingOrders, confirmedOrders,
                manufacturingOrders, shippingOrders,
                returnPendingOrders, todayOrders
        );
    }

    // ===== OPERATION =====
    @Transactional(readOnly = true)
    public OperationDashboardResponse getOperationDashboard(String username) {
        Integer accountId = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found!"))
                .getAccountId();

        Long myInProgress = manufacturingOrderRepository.findAll().stream()
                .filter(m -> m.getAssignedTo().equals(accountId)
                        && "IN_PROGRESS".equals(m.getStatus()))
                .count();

        Long myCompleted = manufacturingOrderRepository.findAll().stream()
                .filter(m -> m.getAssignedTo().equals(accountId)
                        && "COMPLETED".equals(m.getStatus()))
                .count();

        Long totalManufacturing = orderRepository.countByStatus("MANUFACTURING");

        return new OperationDashboardResponse(
                myInProgress, myCompleted, totalManufacturing
        );
    }

    // ===== SHIPPER =====
    @Transactional(readOnly = true)
    public ShipperDashboardResponse getShipperDashboard(String username) {
        Integer accountId = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found!"))
                .getAccountId();

        Long myShipping = shipmentRepository.findAll().stream()
                .filter(s -> s.getShipperId().equals(accountId)
                        && "SHIPPING".equals(s.getDeliveryStatus()))
                .count();

        Long myDelivered = shipmentRepository.findAll().stream()
                .filter(s -> s.getShipperId().equals(accountId)
                        && "DELIVERED".equals(s.getDeliveryStatus()))
                .count();

        Long myFailed = shipmentRepository.findAll().stream()
                .filter(s -> s.getShipperId().equals(accountId)
                        && "FAILED".equals(s.getDeliveryStatus()))
                .count();

        // Tổng đơn đang cần giao (chưa assign cho ai)
        Long pendingShipment = orderRepository.countByStatus("SHIPPING");

        return new ShipperDashboardResponse(
                myShipping, myDelivered, myFailed, pendingShipment
        );
    }
}