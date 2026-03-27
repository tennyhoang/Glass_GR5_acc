package org.group5.springmvcweb.glassesweb.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminDashboardResponse {
    private Long totalOrders;
    private Long pendingOrders;
    private Long confirmedOrders;
    private Long manufacturingOrders;
    private Long shippingOrders;
    private Long deliveredOrders;
    private Long cancelledOrders;
    private Double totalRevenue;
    private Long totalCustomers;
    private Long totalProducts;
    private Long totalStaff;
}