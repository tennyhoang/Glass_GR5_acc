package org.group5.springmvcweb.glassesweb.Controller;

import jakarta.validation.Valid;
import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    // Nhập kho
    @PostMapping("/import")
    public ResponseEntity<InventoryReceiptResponse> importStock(
            Authentication authentication,
            @Valid @RequestBody InventoryReceiptRequest request) {
        InventoryReceiptResponse response = inventoryService
                .importStock(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Xem toàn bộ lịch sử
    @GetMapping
    public ResponseEntity<List<InventoryReceiptResponse>> getAllReceipts() {
        return ResponseEntity.ok(inventoryService.getAllReceipts());
    }

    // Xem theo loại IMPORT hoặc EXPORT
    @GetMapping("/type/{type}")
    public ResponseEntity<List<InventoryReceiptResponse>> getByType(
            @PathVariable String type) {
        return ResponseEntity.ok(inventoryService.getReceiptsByType(type));
    }
}