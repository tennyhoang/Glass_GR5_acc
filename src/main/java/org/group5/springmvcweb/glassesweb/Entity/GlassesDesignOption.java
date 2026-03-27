package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "glasses_design_option")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class GlassesDesignOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "design_option_id")
    private Integer designOptionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "design_id", nullable = false)
    private GlassesDesign glassesDesign;

    @Column(name = "option_id")
    private Integer optionId;

    @Column(name = "option_name", length = 255)
    private String optionName;

    @Column(name = "extra_price", precision = 10, scale = 2)
    private BigDecimal extraPrice;
}