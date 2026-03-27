package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Entity
@Table(name = "ReadyMadeGlasses")
public class ReadyMadeGlasses {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ready_glasses_id")
    private Integer readyGlassesId;

    @NotBlank(message = "Name is required")
    @Column(name = "name", nullable = false)
    private String name;

    @NotNull(message = "Frame ID is required")
    @Column(name = "frame_id", nullable = false)
    private Integer frameId;

    @NotNull(message = "Lens ID is required")
    @Column(name = "lens_id", nullable = false)
    private Integer lensId;

    @Column(name = "fixed_sph", precision = 5, scale = 2)
    private BigDecimal fixedSph;

    @Column(name = "fixed_cyl", precision = 5, scale = 2)
    private BigDecimal fixedCyl;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Positive(message = "Price must be > 0")
    @Column(name = "price", precision = 18, scale = 2)
    private BigDecimal price;

    @Min(value = 0, message = "Stock must be >= 0")
    @Column(name = "stock")
    private Integer stock;

    @Column(name = "status", length = 50)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "frame_id", insertable = false, updatable = false)
    private Frame frame;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lens_id", insertable = false, updatable = false)
    private Lens lens;
}