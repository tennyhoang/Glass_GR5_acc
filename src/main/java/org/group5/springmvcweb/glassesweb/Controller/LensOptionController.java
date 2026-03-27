package org.group5.springmvcweb.glassesweb.Controller;

import jakarta.validation.Valid;
import org.group5.springmvcweb.glassesweb.DTO.CreateLensOptionRequest;
import org.group5.springmvcweb.glassesweb.DTO.LensOptionResponse;
import org.group5.springmvcweb.glassesweb.DTO.UpdateLensOptionRequest;
import org.group5.springmvcweb.glassesweb.Entity.LensOption;
import org.group5.springmvcweb.glassesweb.Service.LensOptionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/lensoption")
public class LensOptionController {

    private final LensOptionService service;

    public LensOptionController(LensOptionService service) {
        this.service = service;
    }

    @PostMapping("/create")
    public LensOptionResponse create(@Valid @RequestBody CreateLensOptionRequest request) {
        LensOption lensOption = service.create(request);
        return LensOptionResponse.fromEntity(lensOption);
    }

    @GetMapping("/{id}")
    public LensOptionResponse getById(@PathVariable Integer id) {
        return LensOptionResponse.fromEntity(service.getById(id));
    }

    @GetMapping("/all")
    public List<LensOptionResponse> getAll() {
        List<LensOption> lensOptions = service.getAll();
        return lensOptions.stream()
                .map(LensOptionResponse::fromEntity)
                .toList();
    }

    @PutMapping("/update/{id}")
    public LensOptionResponse update(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateLensOptionRequest request) {
        LensOption lensOption = service.update(id, request);
        return LensOptionResponse.fromEntity(lensOption);
    }

    @DeleteMapping("/delete/{id}")
    public String delete(@PathVariable Integer id) {
        service.delete(id);
        return "Xóa tùy chọn tròng kính thành công";
    }

    @GetMapping("/public/all")
    public List<LensOptionResponse> getAllPublic() {
        return service.getAll().stream()
                .map(LensOptionResponse::fromEntity)
                .toList();
    }
}