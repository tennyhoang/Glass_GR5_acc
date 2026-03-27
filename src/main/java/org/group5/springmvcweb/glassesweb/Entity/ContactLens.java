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

@Table(name = "ContactLens")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ContactLens {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "contact_lens_id")
    private Integer contactLensId;

    @NotBlank(message = "Name is required")
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "brand", length = 100)
    private String brand;

    @Column(name = "contact_type", length = 50)
    private String contactType;

    @Column(name = "color", length = 100)
    private String color;

    @Column(name = "min_sph", precision = 5, scale = 2)
    private BigDecimal minSph;

    @Column(name = "max_sph", precision = 5, scale = 2)
    private BigDecimal maxSph;

    @Column(name = "min_cyl", precision = 5, scale = 2)
    private BigDecimal minCyl;

    @Column(name = "max_cyl", precision = 5, scale = 2)
    private BigDecimal maxCyl;

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
}