package org.group5.springmvcweb.glassesweb.Service;

import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Entity.*;
import org.group5.springmvcweb.glassesweb.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    @Autowired
    private InventoryReceiptRepository inventoryReceiptRepository;

    @Autowired
    private AccountRepository accountRepository;

    // ===== Nhập kho (IMPORT) =====
    @Transactional
    public InventoryReceiptResponse importStock(
            String username, InventoryReceiptRequest request) {

        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found!"));

        // Validate product type
        List<String> validTypes = List.of(
                "FRAME", "LENS", "READY_MADE", "CONTACT_LENS");
        if (!validTypes.contains(request.getProductType())) {
            throw new RuntimeException("Product type not valid!");
        }

        // Tạo phiếu nhập kho
        InventoryReceipt receipt = new InventoryReceipt();
        receipt.setReceiptType("IMPORT");
        receipt.setProductType(request.getProductType());
        receipt.setProductId(request.getProductId());
        receipt.setQuantity(request.getQuantity());
        receipt.setNote(request.getNote());
        receipt.setCreatedBy(account.getAccountId());

        InventoryReceipt saved = inventoryReceiptRepository.save(receipt);

        return toResponse(saved);
    }

    // ===== Xuất kho (EXPORT) tự động khi đơn hàng CONFIRMED =====
    @Transactional
    public void exportStock(String productType, Integer productId,
                            Integer quantity, Integer accountId) {

        InventoryReceipt receipt = new InventoryReceipt();
        receipt.setReceiptType("EXPORT");
        receipt.setProductType(productType);
        receipt.setProductId(productId);
        receipt.setQuantity(quantity);
        receipt.setNote("Auto export when order confirmed");
        receipt.setCreatedBy(accountId);

        inventoryReceiptRepository.save(receipt);
    }

    // ===== Xem lịch sử nhập/xuất kho =====
    public List<InventoryReceiptResponse> getAllReceipts() {
        return inventoryReceiptRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ===== Xem lịch sử theo loại =====
    public List<InventoryReceiptResponse> getReceiptsByType(String type) {
        List<String> validTypes = List.of("IMPORT", "EXPORT");
        if (!validTypes.contains(type)) {
            throw new RuntimeException("Receipt type not valid!");
        }
        return inventoryReceiptRepository.findByReceiptType(type)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ===== Helper =====
    private InventoryReceiptResponse toResponse(InventoryReceipt receipt) {
        return new InventoryReceiptResponse(
                receipt.getReceiptId(),
                receipt.getReceiptType(),
                receipt.getProductType(),
                receipt.getProductId(),
                receipt.getQuantity(),
                receipt.getNote(),
                receipt.getCreatedBy(),
                receipt.getCreatedAt()
        );
    }
}