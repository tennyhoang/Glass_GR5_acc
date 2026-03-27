package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer shipmentId;

    private Integer orderId;

    private Integer shipperId; // account_id của SHIPPER

    private String carrier;

    private String trackingNumber;

    private LocalDateTime shippedDate;

    private String deliveryStatus; // PENDING, SHIPPING, DELIVERED, FAILED

    @PrePersist
    public void prePersist() {
        this.deliveryStatus = "PENDING";
    }
}