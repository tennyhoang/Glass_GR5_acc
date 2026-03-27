package org.group5.springmvcweb.glassesweb.DTO;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}