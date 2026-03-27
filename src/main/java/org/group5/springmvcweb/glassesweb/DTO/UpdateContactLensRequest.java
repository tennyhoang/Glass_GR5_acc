package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateContactLensRequest {
    private String name;

    private String brand;

    private String contactType;

    private String color;

    private BigDecimal minSph;

    private BigDecimal maxSph;

    private BigDecimal minCyl;

    private BigDecimal maxCyl;

    private String imageUrl;

    @Positive(message = "Price must be > 0")
    private BigDecimal price;

    @Min(value = 0, message = "Stock must be >= 0")
    private Integer stock;

    private String status;
}
