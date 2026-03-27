package org.group5.springmvcweb.glassesweb.Controller;

import jakarta.validation.Valid;
import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Repository.AccountRepository;
import org.group5.springmvcweb.glassesweb.Service.FulfillmentService;
import org.group5.springmvcweb.glassesweb.Service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@RestController
@RequestMapping("/staff")
public class StaffController {

    @Autowired
    private FulfillmentService fulfillmentService;
    @Autowired
    private OrderService orderService;
    @Autowired
    private AccountRepository accountRepository;

    // Xem tất cả đơn hàng
    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // ✅ Lấy danh sách Operation + Shipper để assign (Staff không cần quyền Admin)
    @GetMapping("/accounts")
    public ResponseEntity<?> getAssignableAccounts() {
        var ops     = accountRepository.findByRole("OPERATION");
        var shippers = accountRepository.findByRole("SHIPPER");
        var all = Stream.concat(ops.stream(), shippers.stream())
                .map(a -> Map.of(
                        "accountId", a.getAccountId(),
                        "username",  a.getUsername(),
                        "role",      a.getRole(),
                        "name",      a.getCustomer() != null ? a.getCustomer().getName() : a.getUsername()
                ))
                .toList();
        return ResponseEntity.ok(all);
    }

    // Xác nhận đơn hàng
    @PutMapping("/orders/{orderId}/confirm")
    public ResponseEntity<Map<String, String>> confirmOrder(
            @PathVariable Integer orderId) {
        fulfillmentService.confirmOrder(orderId);
        return ResponseEntity.ok(Map.of("message", "Order confirmed!"));
    }

    // Assign OPERATION
    @PutMapping("/orders/{orderId}/assign-operation")
    public ResponseEntity<Map<String, String>> assignOperation(
            @PathVariable Integer orderId,
            @Valid @RequestBody AssignRequest request) {
        fulfillmentService.assignOperation(orderId, request.getAccountId());
        return ResponseEntity.ok(Map.of("message", "Operation assigned!"));
    }

    // Assign SHIPPER
    @PutMapping("/orders/{orderId}/assign-shipper")
    public ResponseEntity<Map<String, String>> assignShipper(
            @PathVariable Integer orderId,
            @Valid @RequestBody AssignRequest request) {
        fulfillmentService.assignShipper(orderId, request.getAccountId());
        return ResponseEntity.ok(Map.of("message", "Shipper assigned!"));
    }

    // Xử lý hoàn hàng
    @PutMapping("/orders/{orderId}/return")
    public ResponseEntity<Map<String, String>> handleReturn(
            Authentication authentication,
            @PathVariable Integer orderId) {
        fulfillmentService.handleReturnOrder(authentication.getName(), orderId);
        return ResponseEntity.ok(Map.of("message", "Order returned successfully!"));
    }
}