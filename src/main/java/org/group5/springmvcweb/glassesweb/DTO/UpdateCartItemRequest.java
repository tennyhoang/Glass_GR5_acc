package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateCartItemRequest {

    @NotNull(message = "Quantity not empty!")
    @Min(value = 0, message = "Quantity must be >= 0!")
    private Integer quantity;
}