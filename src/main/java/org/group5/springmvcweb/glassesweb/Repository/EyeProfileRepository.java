package org.group5.springmvcweb.glassesweb.Repository;

import org.group5.springmvcweb.glassesweb.Entity.EyeProfile;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EyeProfileRepository extends JpaRepository<EyeProfile, Integer> {

    List<EyeProfile> findByCustomer_CustomerIdOrderByCreatedDateDesc(Integer customerId);

    List<EyeProfile> findByCustomer_CustomerIdAndStatus(
            Integer customerId, EyeProfile.EyeProfileStatus status);

    @Query("""
        SELECT ep FROM EyeProfile ep
        WHERE ep.customer.customerId = :customerId
          AND ep.status = 'ACTIVE'
        ORDER BY ep.createdDate DESC
    """)
    List<EyeProfile> findLatestActiveByCustomerIdList(
            @Param("customerId") Integer customerId, Pageable pageable);

    boolean existsByEyeProfileIdAndCustomer_CustomerId(
            Integer eyeProfileId, Integer customerId);
}