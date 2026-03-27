package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.GlassesDesign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GlassesDesignRepository extends JpaRepository<GlassesDesign, Integer> {
    List<GlassesDesign> findByCustomer_CustomerIdOrderByCreatedDateDesc(Integer customerId);
    List<GlassesDesign> findByCustomer_CustomerIdAndStatus(Integer customerId, String status);
    boolean existsByDesignIdAndCustomer_CustomerId(Integer designId, Integer customerId);
}