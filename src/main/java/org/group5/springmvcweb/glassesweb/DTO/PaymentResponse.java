package org.group5.springmvcweb.glassesweb.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PaymentResponse {
    private Integer paymentId;
    private Integer orderId;
    private String paymentMethod;
    private String paymentStatus;
    private Double paidAmount;
    private LocalDateTime paidDate;
    private String transactionId;
    private String bankAccount;
    private String bankName;
    private String qrCodeUrl;
}