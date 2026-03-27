package org.group5.springmvcweb.glassesweb.Controller;

import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    // ADMIN
    @GetMapping("/admin/dashboard")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }

    // STAFF
    @GetMapping("/staff/dashboard")
    public ResponseEntity<StaffDashboardResponse> getStaffDashboard() {
        return ResponseEntity.ok(dashboardService.getStaffDashboard());
    }

    // OPERATION
    @GetMapping("/operation/dashboard")
    public ResponseEntity<OperationDashboardResponse> getOperationDashboard(
            Authentication authentication) {
        return ResponseEntity.ok(
                dashboardService.getOperationDashboard(
                        authentication.getName()));
    }

    // SHIPPER
    @GetMapping("/shipper/dashboard")
    public ResponseEntity<ShipperDashboardResponse> getShipperDashboard(
            Authentication authentication) {
        return ResponseEntity.ok(
                dashboardService.getShipperDashboard(
                        authentication.getName()));
    }
}
