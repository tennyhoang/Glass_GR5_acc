package org.group5.springmvcweb.glassesweb.Controller;

import jakarta.validation.Valid;
import org.group5.springmvcweb.glassesweb.DTO.CreateReadyMadeGlassesRequest;
import org.group5.springmvcweb.glassesweb.DTO.ReadyMadeGlassesResponse;
import org.group5.springmvcweb.glassesweb.DTO.UpdateReadyMadeGlassesRequest;
import org.group5.springmvcweb.glassesweb.Entity.ReadyMadeGlasses;
import org.group5.springmvcweb.glassesweb.Service.ReadyMadeGlassesService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/rmglasses")
public class ReadyMadeGlassesController {

    private final ReadyMadeGlassesService service;

    public ReadyMadeGlassesController(ReadyMadeGlassesService service) {
        this.service = service;
    }

    @PostMapping("/create")
    public ReadyMadeGlassesResponse create(
            @Valid @RequestBody CreateReadyMadeGlassesRequest request) {
        ReadyMadeGlasses entity = service.create(request);
        return ReadyMadeGlassesResponse.fromEntity(entity);
    }

    @GetMapping("/{id}")
    public ReadyMadeGlassesResponse getById(@PathVariable Integer id) {
        return ReadyMadeGlassesResponse.fromEntity(service.getById(id));
    }

    @GetMapping("/all")
    public List<ReadyMadeGlassesResponse> getAll() {
        return service.getAll().stream()
                .map(ReadyMadeGlassesResponse::fromEntity)
                .toList();
    }

    @PutMapping("/update/{id}")
    public ReadyMadeGlassesResponse update(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateReadyMadeGlassesRequest request) {
        ReadyMadeGlasses entity = service.update(id, request);
        return ReadyMadeGlassesResponse.fromEntity(entity);
    }

    @DeleteMapping("/delete/{id}")
    public String delete(@PathVariable Integer id) {
        service.delete(id);
        return "Xóa kính có sẵn thành công";
    }

    @GetMapping("/public/all")
    public List<ReadyMadeGlassesResponse> getAllPublic() {
        return service.getAll().stream()
                .filter(p -> "ACTIVE".equals(p.getStatus()))
                .map(ReadyMadeGlassesResponse::fromEntity)
                .toList();
    }

    @GetMapping("/public/{id}")
    public ReadyMadeGlassesResponse getByIdPublic(@PathVariable Integer id) {
        return ReadyMadeGlassesResponse.fromEntity(service.getById(id));
    }
}