package org.group5.springmvcweb.glassesweb.Controller;

import jakarta.validation.Valid;
import org.group5.springmvcweb.glassesweb.DTO.ContactLensResponse;
import org.group5.springmvcweb.glassesweb.DTO.CreateContactLensRequest;
import org.group5.springmvcweb.glassesweb.DTO.UpdateContactLensRequest;
import org.group5.springmvcweb.glassesweb.Entity.ContactLens;
import org.group5.springmvcweb.glassesweb.Service.ContactLensService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/admin/contactlens")
public class ContactLensController {

    private final ContactLensService contactLensService;

    public ContactLensController(ContactLensService contactLensService) {
        this.contactLensService = contactLensService;
    }

    @PostMapping("/create")
    public ContactLensResponse create(@Valid @RequestBody CreateContactLensRequest request) {
        ContactLens contactLens = contactLensService.createContactLens(request);
        return ContactLensResponse.fromEntity(contactLens);
    }

    @GetMapping("/{id}")
    public ContactLensResponse getById(@PathVariable Integer id) {
        return ContactLensResponse.fromEntity(contactLensService.getContactLens(id));
    }

    @GetMapping("/all")
    public List<ContactLensResponse> getAll() {
        return contactLensService.getAllContactLens().stream()
                .map(ContactLensResponse::fromEntity)
                .toList();
    }

    @PutMapping("/update/{id}")
    public ContactLensResponse update(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateContactLensRequest request) {
        ContactLens contactLens = contactLensService.updateContactLens(id, request);
        return ContactLensResponse.fromEntity(contactLens);
    }

    @DeleteMapping("/delete/{id}")
    public String delete(@PathVariable Integer id) {
        contactLensService.deleteContactLens(id);
        return "Xóa kính áp tròng thành công";
    }

    @GetMapping("/search")
    public List<ContactLensResponse> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String contactType,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) BigDecimal targetSph,
            @RequestParam(required = false) BigDecimal targetCyl,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        return contactLensService.searchContactLens(
                        name,
                        brand,
                        contactType,
                        color,
                        targetSph,
                        targetCyl,
                        status,
                        minPrice,
                        maxPrice
                ).stream()
                .map(ContactLensResponse::fromEntity)
                .toList();
    }

    @GetMapping("/public/{id}")
    public ContactLensResponse getByIdPublic(@PathVariable Integer id) {
        return ContactLensResponse.fromEntity(contactLensService.getContactLens(id));
    }

    @GetMapping("/public/all")
    public List<ContactLensResponse> getAllPublic() {
        return contactLensService.getAllContactLens().stream()
                .filter(p -> "ACTIVE".equals(p.getStatus()))
                .map(ContactLensResponse::fromEntity)
                .toList();
    }
}