package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;


@Data
public class CreateLensOptionRequest {
    @NotBlank(message = "Index value is required")
    private String indexValue;

    @NotBlank(message = "Coating is required")
    private String coating;

    @Positive(message = "Extra price must be > 0")
    private BigDecimal extraPrice;
}
