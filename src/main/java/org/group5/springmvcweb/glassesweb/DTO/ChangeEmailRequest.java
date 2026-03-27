package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangeEmailRequest {

    @NotBlank
    @Email(message = "Email không hợp lệ")
    private String newEmail;
}