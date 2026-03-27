package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PlaceOrderRequest {

    @NotBlank(message = "Shipping address not empty!")
    private String shippingAddress;

    @NotBlank(message = "Payment method not empty!")
    private String paymentMethod;

    private String discountCode;
}