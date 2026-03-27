package org.group5.springmvcweb.glassesweb.DTO;

import lombok.Builder;
import lombok.Data;
import org.group5.springmvcweb.glassesweb.Entity.Lens;

import java.math.BigDecimal;

@Data
@Builder
public class LensResponse {
    private Integer lensId;
    private String name;
    private String brand;
    private String lensType;
    private Boolean colorChange;
    private String lensSize;
    private BigDecimal minSph;
    private BigDecimal maxSph;
    private String imageUrl;
    private BigDecimal basePrice;
    private Integer stock;
    private String status;


    public static LensResponse fromEntity(Lens lens){
        return LensResponse.builder()
                .lensId(lens.getLensId())
                .name(lens.getName())
                .brand(lens.getBrand())
                .lensType(lens.getLensType())
                .colorChange(lens.getColorChange())
                .lensSize(lens.getLensSize())
                .minSph(lens.getMinSph())
                .maxSph(lens.getMaxSph())
                .imageUrl(lens.getImageUrl())
                .basePrice(lens.getBasePrice())
                .stock(lens.getStock())
                .status(lens.getStatus())
                .build();
    }
}
