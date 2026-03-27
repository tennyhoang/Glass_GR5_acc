package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.ManufacturingOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ManufacturingOrderRepository
        extends JpaRepository<ManufacturingOrder, Integer> {
    Optional<ManufacturingOrder> findByOrderId(Integer orderId);
    List<ManufacturingOrder> findByAssignedTo(Integer assignedTo);
}