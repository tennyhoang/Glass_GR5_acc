package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CreateDiscountRequest {

    @NotBlank(message = "Code không được để trống")
    @Size(max = 50, message = "Code tối đa 50 ký tự")
    private String code;

    @NotBlank(message = "Discount type không được để trống")
    private String discountType;

    @NotNull(message = "Discount value không được để trống")
    @DecimalMin(value = "0.01", message = "Discount value phải lớn hơn 0")
    private BigDecimal discountValue;

    @NotNull(message = "Min quantity không được để trống")
    @Min(value = 1, message = "Min quantity phải lớn hơn hoặc bằng 1")
    private Integer minQuantity;

    @NotNull(message = "Min order amount không được để trống")
    @DecimalMin(value = "0.00", message = "Min order amount không được âm")
    private BigDecimal minOrderAmount;

    @NotNull(message = "StartDate không được để trống")
    private LocalDateTime startDate;

    @NotNull(message = "Enddate không được để trống")
    private LocalDateTime endDate;

    @Pattern(
            regexp = "^(ACTIVE|INACTIVE)?$",
            message = "Trạng thái chỉ được là ACTIVE hoặc INACTIVE"
    )
    private String status;
}
