package org.group5.springmvcweb.glassesweb.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.group5.springmvcweb.glassesweb.Entity.ContactLens;

import java.math.BigDecimal;

@Data
@Builder
public class ContactLensResponse {
    private Integer contactLensId;
    private String name;
    private String brand;
    private String contactType;
    private String color;
    private BigDecimal minSph;
    private BigDecimal maxSph;
    private BigDecimal minCyl;
    private BigDecimal maxCyl;
    private String imageUrl;
    private BigDecimal price;
    private Integer stock;
    private String status;

    public static ContactLensResponse fromEntity(ContactLens contactLens) {
        return ContactLensResponse.builder()
                .contactLensId(contactLens.getContactLensId())
                .name(contactLens.getName())
                .brand(contactLens.getBrand())
                .contactType(contactLens.getContactType())
                .color(contactLens.getColor())
                .minSph(contactLens.getMinSph())
                .maxSph(contactLens.getMaxSph())
                .minCyl(contactLens.getMinCyl())
                .maxCyl(contactLens.getMaxCyl())
                .imageUrl(contactLens.getImageUrl())
                .price(contactLens.getPrice())
                .stock(contactLens.getStock())
                .status(contactLens.getStatus())
                .build();

    }
}
