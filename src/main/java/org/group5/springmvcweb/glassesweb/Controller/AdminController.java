package org.group5.springmvcweb.glassesweb.Controller;

import jakarta.validation.Valid;
import org.group5.springmvcweb.glassesweb.DTO.UpdateProfileRequest;
import org.group5.springmvcweb.glassesweb.DTO.UpdateRoleRequest;
import org.group5.springmvcweb.glassesweb.Entity.Customer;
import org.group5.springmvcweb.glassesweb.Repository.AccountRepository;
import org.group5.springmvcweb.glassesweb.Repository.CustomerRepository;
import org.group5.springmvcweb.glassesweb.Service.AuthService;
import org.group5.springmvcweb.glassesweb.Service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AuthService authService;
    @Autowired
    private CustomerService customerService;
    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AccountRepository accountRepository;

    // Xem tất cả accounts
    @GetMapping("/accounts")
    public ResponseEntity<?> getAllAccounts() {
        return ResponseEntity.ok(accountRepository.findAll().stream()
                .map(a -> {
                    Customer c = a.getCustomer();
                    return Map.of(
                            "accountId", a.getAccountId(),
                            "username", a.getUsername(),
                            "role", a.getRole(),
                            "status", c != null ? c.getStatus() : "N/A",
                            "createdAt", a.getCreatedAt() != null ? a.getCreatedAt().toString() : "",
                            "name", c != null ? c.getName() : "",
                            "email", c != null ? c.getEmail() : "",
                            "customerId", c != null ? c.getCustomerId() : null
                    );
                })
                .toList());
    }
    // Block / Unblock customer
    @PutMapping("/customers/{customerId}/status")
    public ResponseEntity<Map<String, String>> updateCustomerStatus(
            @PathVariable Integer customerId,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (!List.of("ACTIVE", "BLOCKED").contains(status)) {
            throw new RuntimeException("Status không hợp lệ!");
        }
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found!"));
        customer.setStatus(status);
        customerRepository.save(customer);
        return ResponseEntity.ok(Map.of("message",
                "BLOCKED".equals(status) ? "Đã khóa tài khoản!" : "Đã mở khóa tài khoản!"));
    }

    @PutMapping("/accounts/{id}/role")
    public ResponseEntity<Map<String, String>> updateRole(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateRoleRequest request) {
        authService.updateRole(id, request.getRole());
        return ResponseEntity.ok(Map.of("message", "Role update successful!"));
    }
    // Admin update profile cho bất kỳ ai
    @PutMapping("/customers/{id}/profile")
    public ResponseEntity<Map<String, String>> adminUpdateProfile(
            @PathVariable Integer id,
            @RequestBody UpdateProfileRequest request) {

        customerService.adminUpdateProfile(id, request);
        return ResponseEntity.ok(Map.of("message", "Cập nhật thông tin thành công!"));
    }
}