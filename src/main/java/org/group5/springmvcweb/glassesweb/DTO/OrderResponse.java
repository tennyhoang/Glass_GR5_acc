package org.group5.springmvcweb.glassesweb.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class OrderResponse {
    private Integer orderId;
    private String status;
    private String shippingAddress;
    private LocalDateTime orderDate;
    private Double totalAmount;
    private Double discountAmount;
    private Double finalAmount;
    private String discountCode;
    private String paymentMethod;
    private String paymentStatus;
    private String manufacturingStatus;
    private String customerName;
    private Boolean shipperAssigned;  // ✅ mới
    private List<CartItemResponse> items;
}