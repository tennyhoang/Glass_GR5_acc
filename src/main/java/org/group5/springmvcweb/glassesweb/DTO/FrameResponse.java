package org.group5.springmvcweb.glassesweb.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.group5.springmvcweb.glassesweb.Entity.Frame;

import java.math.BigDecimal;

@Data
@Builder
public class FrameResponse {
    private Integer frameId;
    private String name;
    private String brand;
    private String material;
    private String size;
    private String rimType;
    private String frameType;
    private String color;
    private String imageUrl;
    private BigDecimal price;
    private Integer stock;
    private String status;

    public static FrameResponse fromEntity(Frame frame) {
        return FrameResponse.builder()
                .frameId(frame.getFrameId())
                .name(frame.getName())
                .brand(frame.getBrand())
                .material(frame.getMaterial())
                .size(frame.getSize())
                .rimType(frame.getRimType())
                .frameType(frame.getFrameType())
                .color(frame.getColor())
                .imageUrl(frame.getImageUrl())
                .price(frame.getPrice())
                .stock(frame.getStock())
                .status(frame.getStatus())
                .build();
    }

}
