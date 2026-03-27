package org.group5.springmvcweb.glassesweb.DTO;


import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;


@Data
public class UpdateLensOptionRequest {


    private String indexValue;

    private String coating;

    @Positive(message = "Extra price must be > 0")
    private BigDecimal extraPrice;
}
