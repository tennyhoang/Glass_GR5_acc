package org.group5.springmvcweb.glassesweb.Controller;

import jakarta.validation.Valid;
import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Service.FulfillmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/operation")
public class OperationController {

    @Autowired
    private FulfillmentService fulfillmentService;

    // ✅ Lấy danh sách đơn hàng được giao cho operation hiện tại
    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(
                fulfillmentService.getMyManufacturingOrders(authentication.getName())
        );
    }

    // Cập nhật trạng thái sản xuất
    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<Map<String, String>> updateStatus(
            Authentication authentication,
            @PathVariable Integer orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        fulfillmentService.updateManufacturingStatus(
                authentication.getName(), orderId, request.getStatus());
        return ResponseEntity.ok(Map.of("message", "Status updated!"));
    }
}