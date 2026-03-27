package org.group5.springmvcweb.glassesweb.Controller;

import jakarta.validation.Valid;
import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // Lấy thông tin Payment + QR Code
    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getPaymentInfo(
            @PathVariable Integer orderId) {
        return ResponseEntity.ok(
                paymentService.getPaymentInfo(orderId));
    }

    // ✅ Customer xác nhận đã chuyển khoản
    // Hệ thống tự động ghi nhận PAID
    @PostMapping("/confirm/{orderId}")
    public ResponseEntity<PaymentResponse> confirmBankTransfer(
            @PathVariable Integer orderId) {
        return ResponseEntity.ok(
                paymentService.confirmBankTransfer(orderId));
    }

    // Giả lập thanh toán (dùng để test Postman)
    @PostMapping("/simulate/{orderId}")
    public ResponseEntity<PaymentResponse> simulatePayment(
            @PathVariable Integer orderId) {
        return ResponseEntity.ok(
                paymentService.simulatePayment(orderId));
    }
}
