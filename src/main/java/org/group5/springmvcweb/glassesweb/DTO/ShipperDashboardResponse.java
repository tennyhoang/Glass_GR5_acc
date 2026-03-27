package org.group5.springmvcweb.glassesweb.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ShipperDashboardResponse {
    private Long myShipping;      // Đang giao
    private Long myDelivered;     // Đã giao thành công
    private Long myFailed;        // Giao thất bại
    private Long pendingShipment; // Tổng đơn đang chờ giao
}