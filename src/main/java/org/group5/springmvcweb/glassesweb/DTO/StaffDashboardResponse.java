package org.group5.springmvcweb.glassesweb.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StaffDashboardResponse {
    private Long pendingOrders;
    private Long confirmedOrders;
    private Long manufacturingOrders;
    private Long shippingOrders;
    private Long returnPendingOrders;
    private Long todayOrders;
}