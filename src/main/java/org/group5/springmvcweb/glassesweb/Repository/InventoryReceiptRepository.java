package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.InventoryReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InventoryReceiptRepository
        extends JpaRepository<InventoryReceipt, Integer> {
    List<InventoryReceipt> findByProductTypeAndProductId(
            String productType, Integer productId);
    List<InventoryReceipt> findByReceiptType(String receiptType);
}