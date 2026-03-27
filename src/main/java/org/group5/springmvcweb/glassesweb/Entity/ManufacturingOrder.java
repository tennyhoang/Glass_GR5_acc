package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "manufacturing_order")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ManufacturingOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer manufacturingId;

    private Integer orderId;

    private Integer assignedTo; // account_id của OPERATION

    private LocalDateTime startDate;

    private String status; // PENDING, IN_PROGRESS, COMPLETED

    @PrePersist
    public void prePersist() {
        this.startDate = LocalDateTime.now();
        this.status = "PENDING";
    }
}