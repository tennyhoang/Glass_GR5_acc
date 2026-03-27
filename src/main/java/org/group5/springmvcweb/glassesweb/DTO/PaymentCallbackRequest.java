package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentCallbackRequest {

    @NotNull(message = "Order ID not empty")
    private Integer orderId;

    @NotBlank(message = "Transaction ID not empty")
    private String transactionId;

    @NotBlank(message = "Status not empty")
    private String status; // SUCCESS, FAILED
}