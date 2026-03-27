package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Username not Empty")
    private String username;

    @NotBlank(message = "Password not Empty")
    @Size(min = 6, message = "Password at least 6 characters")
    private String password;

    @NotBlank(message = "Email not Empty")
    @Email(message = "Email not valid")
    private String email;

    // Thông tin Customer
    @NotBlank(message = "Name not Empty")
    private String name;

    private String phone;
    private String address;
}