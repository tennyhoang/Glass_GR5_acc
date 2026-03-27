package org.group5.springmvcweb.glassesweb.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class InventoryReceiptResponse {
    private Integer receiptId;
    private String receiptType;
    private String productType;
    private Integer productId;
    private Integer quantity;
    private String note;
    private Integer createdBy;
    private LocalDateTime createdAt;
}