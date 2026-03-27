package org.group5.springmvcweb.glassesweb.DTO;

import lombok.Builder;
import lombok.Data;
import org.group5.springmvcweb.glassesweb.Entity.Discount;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class DiscountResponse {
    private Integer discountId;
    private String code;
    private String discountType;
    private BigDecimal discountValue;
    private Integer minQuantity;
    private BigDecimal minOrderAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status;

    public static DiscountResponse fromEntity(Discount discount) {
        return DiscountResponse.builder()
                .discountId(discount.getDiscountId())
                .code(discount.getCode())
                .discountType(discount.getDiscountType())
                .discountValue(discount.getDiscountValue())
                .minQuantity(discount.getMinQuantity())
                .minOrderAmount(discount.getMinOrderAmount())
                .startDate(discount.getStartDate())
                .endDate(discount.getEndDate())
                .status(discount.getStatus())
                .build();
    }
}