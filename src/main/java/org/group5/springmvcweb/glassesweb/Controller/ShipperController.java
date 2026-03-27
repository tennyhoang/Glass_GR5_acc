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
@RequestMapping("/shipper")
public class ShipperController {

    @Autowired
    private FulfillmentService fulfillmentService;

    // ✅ Lấy danh sách đơn hàng được phân công cho shipper hiện tại
    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getMyOrders(Authentication authentication) {
        return ResponseEntity.ok(
                fulfillmentService.getMyShipmentOrders(authentication.getName())
        );
    }

    // Cập nhật trạng thái giao hàng (SHIPPING / DELIVERED / FAILED)
    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<Map<String, String>> updateStatus(
            Authentication authentication,
            @PathVariable Integer orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        fulfillmentService.updateDeliveryStatus(
                authentication.getName(), orderId, request.getStatus());
        return ResponseEntity.ok(Map.of("message", "Delivery status updated!"));
    }

    // Báo giao thất bại
    @PutMapping("/orders/{orderId}/failed")
    public ResponseEntity<Map<String, String>> reportFailed(
            Authentication authentication,
            @PathVariable Integer orderId) {
        fulfillmentService.handleFailedDelivery(
                authentication.getName(), orderId);
        return ResponseEntity.ok(Map.of("message", "Reported failed delivery!"));
    }

    // Xem thông tin shipment
    @GetMapping("/orders/{orderId}/shipment")
    public ResponseEntity<ShipmentResponse> getShipment(
            @PathVariable Integer orderId) {
        return ResponseEntity.ok(
                fulfillmentService.getShipment(orderId));
    }
}
