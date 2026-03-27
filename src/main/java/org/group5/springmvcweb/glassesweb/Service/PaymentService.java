package org.group5.springmvcweb.glassesweb.Service;

import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Entity.*;
import org.group5.springmvcweb.glassesweb.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    // ===== Lấy thông tin Payment + QR Code =====
    @Transactional
    public PaymentResponse getPaymentInfo(Integer orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found!"));

        // Tạo QR Code nếu là BANKING và chưa có
        if (payment.getQrCodeUrl() == null
                && "BANKING".equals(payment.getPaymentMethod())) {
            payment.setBankAccount("1043784493");
            payment.setBankName("VCB");
            String qrUrl = generateQRCode(
                    payment.getBankAccount(),
                    payment.getBankName(),
                    payment.getPaidAmount(),
                    orderId
            );
            payment.setQrCodeUrl(qrUrl);
            paymentRepository.save(payment);
        }

        return toResponse(payment);
    }

    // ===== Customer xác nhận đã chuyển khoản =====
    // Hệ thống tự động ghi nhận PAID không cần ai kiểm tra
    @Transactional
    public PaymentResponse confirmBankTransfer(Integer orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found!"));

        if (!"PENDING".equals(payment.getPaymentStatus())) {
            throw new RuntimeException("Payment already processed!");
        }

        if (!"BANKING".equals(payment.getPaymentMethod())) {
            throw new RuntimeException("Only BANKING method can confirm transfer!");
        }

        // ✅ Tự động ghi nhận PAID
        String fakeTransactionId = "TXN" + UUID.randomUUID()
                .toString().replace("-", "").substring(0, 10).toUpperCase();

        payment.setPaymentStatus("PAID");
        payment.setTransactionId(fakeTransactionId);
        payment.setPaidDate(LocalDateTime.now());
        payment.setBankName("VCB");
        payment.setBankAccount("1043784493");
        paymentRepository.save(payment);

        return toResponse(payment);
    }

    // ===== Giả lập thanh toán thành công (dùng để test) =====
    @Transactional
    public PaymentResponse simulatePayment(Integer orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found!"));

        if (!"PENDING".equals(payment.getPaymentStatus())) {
            throw new RuntimeException("Payment already processed!");
        }

        String fakeTransactionId = "TXN" + UUID.randomUUID()
                .toString().replace("-", "").substring(0, 10).toUpperCase();

        payment.setPaymentStatus("PAID");
        payment.setTransactionId(fakeTransactionId);
        payment.setPaidDate(LocalDateTime.now());
        payment.setBankName("VCB");
        payment.setBankAccount("1043784493");
        paymentRepository.save(payment);

        return toResponse(payment);
    }

    // ===== Helper: Tạo QR Code dùng VietQR =====
    private String generateQRCode(String bankAccount, String bankName,
                                  Double amount, Integer orderId) {
        String description = "Thanh toan don hang " + orderId;
        return String.format(
                "https://img.vietqr.io/image/%s-%s-compact2.png?amount=%d&addInfo=%s",
                bankName,
                bankAccount,
                amount.intValue(),
                description.replace(" ", "%20")
        );
    }

    // ===== Helper =====
    private PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(
                payment.getPaymentId(),
                payment.getOrderId(),
                payment.getPaymentMethod(),
                payment.getPaymentStatus(),
                payment.getPaidAmount(),
                payment.getPaidDate(),
                payment.getTransactionId(),
                payment.getBankAccount(),
                payment.getBankName(),
                payment.getQrCodeUrl()
        );
    }
}