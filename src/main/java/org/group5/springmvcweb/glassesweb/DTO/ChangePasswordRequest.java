package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {

    @NotBlank(message = "Password cũ không được để trống")
    private String oldPassword;

    @NotBlank(message = "Password mới không được để trống")
    @Size(min = 6, message = "Password mới tối thiểu 6 ký tự")
    private String newPassword;
}