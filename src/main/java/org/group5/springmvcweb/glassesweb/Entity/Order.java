package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer orderId;

    private Integer customerId;

    private LocalDateTime orderDate;

    private String status; // PENDING, CONFIRMED, MANUFACTURING, SHIPPING, DELIVERED, CANCELLED

    private String shippingAddress;

    private Double totalAmount;

    private Integer discountId;

    private Double discountAmount;

    private Double finalAmount;

    @Column(name = "discount_code")
    private String discountCode;

    @PrePersist
    public void prePersist() {
        this.orderDate = LocalDateTime.now();
        this.status = "PENDING";
        this.discountAmount = 0.0;
    }
}