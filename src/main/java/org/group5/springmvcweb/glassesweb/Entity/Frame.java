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
@Table(name = "Frame")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Frame {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "frame_id")
    private Integer frameId;

    @NotBlank(message = "Name is required")
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "brand", length = 100)
    private String brand;

    @Column(name = "material", length = 100)
    private String material;

    @Column(name = "size", length = 50)
    private String size;

    @Column(name = "rim_type", length = 50)
    private String rimType;

    @Column(name = "frame_type", length = 50)
    private String frameType;

    @Column(name = "color", length = 100)
    private String color;

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