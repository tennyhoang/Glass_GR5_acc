package org.group5.springmvcweb.glassesweb.Service;

import org.group5.springmvcweb.glassesweb.DTO.CreateFrameRequest;
import org.group5.springmvcweb.glassesweb.DTO.UpdateFrameRequest;
import org.group5.springmvcweb.glassesweb.Entity.Frame;

import java.math.BigDecimal;
import java.util.List;

public interface FrameService {
    Frame createFrame(CreateFrameRequest request);
    Frame updateFrame(Integer id, UpdateFrameRequest request);
    Frame getFrameById(Integer id);
    List<Frame> getAllFrames();
    void deleteFrame(Integer id);
    List<Frame> searchFrame(String name,
                            String brand,
                            String material,
                            String size,
                            String rimType,
                            String frameType,
                            String color,
                            String status,
                            BigDecimal minPrice,
                            BigDecimal maxPrice);
}
