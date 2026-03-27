package org.group5.springmvcweb.glassesweb.DTO;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;


@Data

public class UpdateFrameRequest {

    private String name;

    private String brand;

    private String material;

    @Pattern(
            regexp = "^(S|M|L)$",
            message = "Kích thước chỉ được là S, M hoặc L"
    )
    private String size;

    @Pattern(
            regexp = "^(FULL|HALF|RIMLESS)$",
            message = "Kích thước chỉ được là FULL, HALF hoặc RIMLESS"
    )
    private String rimType;

    @Pattern(
            regexp = "^(EYEGLASSES|SUNGLASSES)$",
            message = "Loại gọng chỉ được là EYEGLASSES hoặc SUNGLASSES"
    )
    private String frameType;

    private String color;

    private String imageUrl;

    @Positive(message = "Price must be > 0")
    private BigDecimal price;

    @Min(value = 0, message = "Stock must be >= 0")
    private Integer stock;

    @Pattern(
            regexp = "^(ACTIVE|INACTIVE)?$",
            message = "Trạng thái chỉ được là ACTIVE hoặc INACTIVE"
    )
    private String status;

}
