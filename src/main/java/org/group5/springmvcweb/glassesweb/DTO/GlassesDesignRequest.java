package org.group5.springmvcweb.glassesweb.DTO;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class GlassesDesignRequest {

    @NotNull(message = "Vui lòng chọn hồ sơ mắt")
    private Integer eyeProfileId;

    @NotNull(message = "Vui lòng chọn gọng kính")
    private Integer frameId;

    @NotNull(message = "Vui lòng chọn tròng kính")
    private Integer lensId;

    private List<Integer> selectedOptionIds;
    private String designName;
}