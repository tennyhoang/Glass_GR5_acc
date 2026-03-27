package org.group5.springmvcweb.glassesweb.Controller;

import jakarta.validation.Valid;
import org.group5.springmvcweb.glassesweb.DTO.CreateFrameRequest;
import org.group5.springmvcweb.glassesweb.DTO.FrameResponse;
import org.group5.springmvcweb.glassesweb.DTO.UpdateFrameRequest;
import org.group5.springmvcweb.glassesweb.Entity.Frame;
import org.group5.springmvcweb.glassesweb.Service.FrameService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/admin/frames")
public class FrameController {

    private final FrameService frameService;

    public FrameController(FrameService frameService) {
        this.frameService = frameService;
    }

    @GetMapping("/public/all")
    public List<FrameResponse> getAllPublic() {
        return frameService.getAllFrames().stream()
                .filter(f -> "ACTIVE".equals(f.getStatus()))
                .map(FrameResponse::fromEntity)
                .toList();
    }

    @GetMapping("/public/{id}")
    public FrameResponse getByIdPublic(@PathVariable Integer id) {
        return FrameResponse.fromEntity(frameService.getFrameById(id));
    }

    @PostMapping("/create")
    public FrameResponse createFrame(
            @Valid @RequestBody CreateFrameRequest request){
        Frame frame = frameService.createFrame(request);
        return FrameResponse.fromEntity(frame);
    }

    @GetMapping("/{id}")
    public FrameResponse getFrameById(@PathVariable Integer id){
        Frame frame = frameService.getFrameById(id);
        return FrameResponse.fromEntity(frame);
    }

    @GetMapping("/allframes")
    public List<FrameResponse> getAllFrames(){
        List<Frame> frames = frameService.getAllFrames();

        return frames.stream().map(FrameResponse::fromEntity).toList();
    }

    @PutMapping("/update/{id}")
    public FrameResponse updateFrame(
            @Valid
            @PathVariable Integer id,
            @RequestBody UpdateFrameRequest request){
        Frame frame = frameService.updateFrame(id, request);
        return FrameResponse.fromEntity(frame);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteFrame(@PathVariable Integer id){
        frameService.deleteFrame(id);
        return "success";
    }

    @GetMapping("/search")
    public List<FrameResponse> searchFrame(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String material,
            @RequestParam(required = false) String size,
            @RequestParam(required = false) String rimType,
            @RequestParam(required = false) String frameType,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        return frameService.searchFrame(
                        name,
                        brand,
                        material,
                        size,
                        rimType,
                        frameType,
                        color,
                        status,
                        minPrice,
                        maxPrice
                ).stream()
                .map(FrameResponse::fromEntity)
                .toList();
    }

}
