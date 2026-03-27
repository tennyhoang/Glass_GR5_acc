package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CartItemRequest {

    @NotBlank(message = "Product type not empty")
    private String productType;
    // READY_MADE, MY_GLASSES, CONTACT_LENS

    @NotNull(message = "Product ID not empty")
    private Integer productId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity = 1;
}