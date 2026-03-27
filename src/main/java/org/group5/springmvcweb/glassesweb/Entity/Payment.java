package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer paymentId;

    private Integer orderId;

    private String paymentMethod; // CASH, BANKING, MOMO, VNPAY

    private String paymentStatus; // PENDING, PAID, FAILED, REFUNDED

    private Double paidAmount;

    private LocalDateTime paidDate;

    private String transactionId;

    private String bankAccount;

    private String bankName;

    private String qrCodeUrl;
}