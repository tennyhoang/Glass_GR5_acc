package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.*;
import lombok.*;
import org.group5.springmvcweb.glassesweb.Entity.EyePrescription;
import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PrescriptionRequest {

    @NotNull(message = "Vui lòng chọn mắt (LEFT/RIGHT)")
    private EyePrescription.EyeSide eyeSide;

    @DecimalMin(value = "-20.00") @DecimalMax(value = "20.00")
    private BigDecimal sph;

    @DecimalMin(value = "-10.00") @DecimalMax(value = "0.00")
    private BigDecimal cyl;

    @Min(0) @Max(180)
    private Integer axis;

    @DecimalMin(value = "50.00") @DecimalMax(value = "80.00")
    private BigDecimal pd;

    @DecimalMin(value = "0.00") @DecimalMax(value = "4.00")
    private BigDecimal add;
}