package org.group5.springmvcweb.glassesweb.Controller;

import jakarta.validation.Valid;
import org.group5.springmvcweb.glassesweb.DTO.CreateLensRequest;
import org.group5.springmvcweb.glassesweb.DTO.LensResponse;
import org.group5.springmvcweb.glassesweb.DTO.UpdateLensRequest;
import org.group5.springmvcweb.glassesweb.Entity.Lens;
import org.group5.springmvcweb.glassesweb.Service.LensService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/admin/lens")
public class LensController {

    private final LensService lensService;

    public LensController(LensService lensService) {
        this.lensService = lensService;
    }

    @GetMapping("/public/all")
    public List<LensResponse> getAllPublic() {
        return lensService.getAllLens().stream()
                .filter(l -> "ACTIVE".equals(l.getStatus()))
                .map(LensResponse::fromEntity)
                .toList();
    }

    @GetMapping("/public/{id}")
    public LensResponse getByIdPublic(@PathVariable Integer id) {
        return LensResponse.fromEntity(lensService.getLensById(id));
    }

    @PostMapping("/create")
    public LensResponse createLens(@Valid @RequestBody CreateLensRequest request) {
        Lens lens = lensService.createLens(request);
        return LensResponse.fromEntity(lens);
    }

    @GetMapping("/{id}")
    public LensResponse getLensById(@PathVariable Integer id) {
        Lens lens = lensService.getLensById(id);
        return LensResponse.fromEntity(lens);
    }

    @GetMapping("/all")
    public List<LensResponse> getAllLens() {
        List<Lens> lensList = lensService.getAllLens();
        return lensList.stream()
                .map(LensResponse::fromEntity)
                .toList();
    }

    @PutMapping("/update/{id}")
    public LensResponse updateLens(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateLensRequest request) {
        Lens lens = lensService.updateLens(id, request);
        return LensResponse.fromEntity(lens);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteLens(@PathVariable Integer id) {
        lensService.deleteLens(id);
        return "Xóa tròng kính thành công";
    }

    @GetMapping("/search")
    public List<LensResponse> searchLens(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String lensType,
            @RequestParam(required = false) Boolean colorChange,
            @RequestParam(required = false) String lensSize,
            @RequestParam(required = false) BigDecimal targetSph,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        return lensService.searchLens(
                        name,
                        brand,
                        lensType,
                        colorChange,
                        lensSize,
                        targetSph,
                        status,
                        minPrice,
                        maxPrice
                ).stream()
                .map(LensResponse::fromEntity)
                .toList();
    }
}