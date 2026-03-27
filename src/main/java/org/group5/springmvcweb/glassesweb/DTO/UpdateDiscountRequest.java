package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class UpdateDiscountRequest {

    @Size(max = 50, message = "Code tối đa 50 ký tự")
    private String code;

    private String discountType;

    @DecimalMin(value = "0.01", message = "Discount value phải lớn hơn 0")
    private BigDecimal discountValue;

    @Min(value = 1, message = "Min quantity phải lớn hơn hoặc bằng 1")
    private Integer minQuantity;

    @DecimalMin(value = "0.00", message = "Min order amount không được âm")
    private BigDecimal minOrderAmount;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    @Pattern(
            regexp = "^(ACTIVE|INACTIVE)?$",
            message = "Trạng thái chỉ được là ACTIVE hoặc INACTIVE"
    )
    private String status;
}
