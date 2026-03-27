package org.group5.springmvcweb.glassesweb.Controller;

import jakarta.validation.Valid;
import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Đặt hàng
    @PostMapping("/place")
    public ResponseEntity<OrderResponse> placeOrder(
            Authentication authentication,
            @Valid @RequestBody PlaceOrderRequest request) {
        OrderResponse response = orderService.placeOrder(
                authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Xem danh sách đơn hàng của mình
    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            Authentication authentication) {
        return ResponseEntity.ok(
                orderService.getMyOrders(authentication.getName()));
    }

    // Customer xem trạng thái đơn hàng
    @GetMapping("/{orderId}/tracking")
    public ResponseEntity<OrderTrackingResponse> trackOrder(
            Authentication authentication,
            @PathVariable Integer orderId) {
        return ResponseEntity.ok(
                orderService.trackOrder(authentication.getName(), orderId));
    }

    // Huỷ đơn hàng
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<Map<String, String>> cancelOrder(
            Authentication authentication,
            @PathVariable Integer orderId) {
        orderService.cancelOrder(authentication.getName(), orderId);
        return ResponseEntity.ok(Map.of("message", "Order cancelled!"));
    }
}