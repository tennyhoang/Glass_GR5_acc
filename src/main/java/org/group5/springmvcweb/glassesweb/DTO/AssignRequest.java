package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignRequest {

    @NotNull(message = "Account ID not empty")
    private Integer accountId; // ID của OPERATION hoặc SHIPPER
}