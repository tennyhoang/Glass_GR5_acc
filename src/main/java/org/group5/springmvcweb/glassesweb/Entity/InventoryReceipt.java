package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_receipt")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer receiptId;

    private String receiptType; // IMPORT, EXPORT

    private String productType; // FRAME, LENS, READY_MADE, CONTACT_LENS

    private Integer productId;

    private Integer quantity;

    private String note;

    private Integer createdBy; // account_id

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}