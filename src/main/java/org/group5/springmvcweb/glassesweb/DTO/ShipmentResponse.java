package org.group5.springmvcweb.glassesweb.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ShipmentResponse {
    private Integer shipmentId;
    private Integer orderId;
    private String carrier;
    private String trackingNumber;
    private LocalDateTime shippedDate;
    private String deliveryStatus;
}