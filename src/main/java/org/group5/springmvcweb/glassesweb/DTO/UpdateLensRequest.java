package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateLensRequest {

    private String name;

    private String brand;

    private String lensType;

    private Boolean colorChange;

    private String lensSize;

    private BigDecimal minSph;

    private BigDecimal maxSph;

    private String imageUrl;

    @Positive(message = "Base price must be > 0")
    private BigDecimal basePrice;

    @Min(value = 0, message = "Stock must be >= 0")
    private Integer stock;

    private String status;
}
