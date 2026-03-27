package org.group5.springmvcweb.glassesweb.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class OrderTrackingResponse {
    private Integer orderId;
    private String currentStatus;
    private String shippingAddress;
    private LocalDateTime orderDate;
    private Double finalAmount;
    private String paymentStatus;
    private List<TrackingStep> steps;

    @Data
    @AllArgsConstructor
    public static class TrackingStep {
        private String status;
        private String label;
        private Boolean completed;
    }
}