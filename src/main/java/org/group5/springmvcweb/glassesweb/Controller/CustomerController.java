package org.group5.springmvcweb.glassesweb.Controller;

import jakarta.validation.Valid;
import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/customer")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    // Cập nhật thông tin cá nhân
    @PutMapping("/profile")
    public ResponseEntity<Map<String, String>> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {

        customerService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Cập nhật thông tin thành công!"));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        return ResponseEntity.ok(
                customerService.getProfile(authentication.getName()));
    }

    // Đổi email
    @PutMapping("/change-email")
    public ResponseEntity<Map<String, String>> changeEmail(
            Authentication authentication,
            @Valid @RequestBody ChangeEmailRequest request) {

        customerService.changeEmail(authentication.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Đổi email thành công!"));
    }

    // Đổi password
    @PutMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {

        customerService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Đổi password thành công!"));
    }
}