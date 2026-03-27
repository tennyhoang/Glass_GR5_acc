package org.group5.springmvcweb.glassesweb.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CustomerProfileResponse {
    private Integer accountId;
    private String username;
    private String role;
    private Integer customerId;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String status;
}