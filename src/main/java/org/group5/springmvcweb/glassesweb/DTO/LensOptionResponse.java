package org.group5.springmvcweb.glassesweb.DTO;



import lombok.Builder;
import lombok.Data;
import org.group5.springmvcweb.glassesweb.Entity.LensOption;

import java.math.BigDecimal;


@Data
@Builder
public class LensOptionResponse {

    private Integer lensOptionId;
    private String indexValue;
    private String coating;
    private BigDecimal extraPrice;

    public static LensOptionResponse fromEntity(LensOption lensOption) {
        return LensOptionResponse.builder()
                .lensOptionId(lensOption.getLensOptionId())
                .indexValue(lensOption.getIndexValue())
                .coating(lensOption.getCoating())
                .extraPrice(lensOption.getExtraPrice())
                .build();
    }
}
