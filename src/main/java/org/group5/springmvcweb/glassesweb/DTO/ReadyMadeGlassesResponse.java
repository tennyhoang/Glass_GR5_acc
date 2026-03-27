package org.group5.springmvcweb.glassesweb.DTO;

import lombok.Builder;
import lombok.Data;
import org.group5.springmvcweb.glassesweb.Entity.ReadyMadeGlasses;

import java.math.BigDecimal;


@Data
@Builder
public class ReadyMadeGlassesResponse {
    private Integer readyGlassesId;
    private String name;
    private Integer frameId;
    private Integer lensId;
    private BigDecimal fixedSph;
    private BigDecimal fixedCyl;
    private String imageUrl;
    private BigDecimal price;
    private Integer stock;
    private String status;

    public static ReadyMadeGlassesResponse fromEntity(ReadyMadeGlasses readyMadeGlasses) {
        return ReadyMadeGlassesResponse.builder()
                .readyGlassesId(readyMadeGlasses.getReadyGlassesId())
                .name(readyMadeGlasses.getName())
                .frameId(readyMadeGlasses.getFrameId())
                .lensId(readyMadeGlasses.getLensId())
                .fixedSph(readyMadeGlasses.getFixedSph())
                .fixedCyl(readyMadeGlasses.getFixedCyl())
                .imageUrl(readyMadeGlasses.getImageUrl())
                .price(readyMadeGlasses.getPrice())
                .stock(readyMadeGlasses.getStock())
                .status(readyMadeGlasses.getStatus())
                .build();
    }
}
