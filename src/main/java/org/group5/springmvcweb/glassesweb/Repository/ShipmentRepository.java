package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ShipmentRepository
        extends JpaRepository<Shipment, Integer> {
    Optional<Shipment> findByOrderId(Integer orderId);
    List<Shipment> findByShipperId(Integer shipperId);
}