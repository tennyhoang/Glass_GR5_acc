package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "Lens")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Lens {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lens_id")
    private Integer lensId;

    @NotBlank(message = "Name is required")
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "brand", length = 100)
    private String brand;

    @Column(name = "lens_type", length = 100)
    private String lensType;

    @Column(name = "color_change")
    private Boolean colorChange;

    @Column(name = "lens_size", length = 50)
    private String lensSize;

    @Column(name = "min_sph", precision = 5, scale = 2)
    private BigDecimal minSph;

    @Column(name = "max_sph", precision = 5, scale = 2)
    private BigDecimal maxSph;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Positive(message = "Base price must be > 0")
    @Column(name = "base_price", precision = 18, scale = 2)
    private BigDecimal basePrice;

    // ✅ Thêm price cho BE3 dùng
    @Column(name = "price", precision = 18, scale = 2)
    private BigDecimal price;

    @Min(value = 0, message = "Stock must be >= 0")
    @Column(name = "stock")
    private Integer stock;

    @Column(name = "status", length = 50)
    private String status;
}