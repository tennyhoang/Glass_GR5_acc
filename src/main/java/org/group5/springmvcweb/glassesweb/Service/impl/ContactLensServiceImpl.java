package org.group5.springmvcweb.glassesweb.Service.impl;

import org.group5.springmvcweb.glassesweb.DTO.CreateContactLensRequest;
import org.group5.springmvcweb.glassesweb.DTO.UpdateContactLensRequest;
import org.group5.springmvcweb.glassesweb.Entity.ContactLens;
import org.group5.springmvcweb.glassesweb.Repository.ContactLensRepository;
import org.group5.springmvcweb.glassesweb.Service.ContactLensService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ContactLensServiceImpl implements ContactLensService {

    private final ContactLensRepository repo;

    public ContactLensServiceImpl(ContactLensRepository repo) {
        this.repo = repo;
    }

    @Override
    public ContactLens createContactLens(CreateContactLensRequest request) {
        ValidateContactLens(request.getName(), request.getContactType(),
                request.getMinSph(), request.getMaxSph(), request.getMinCyl(), request.getMaxCyl(),
                request.getPrice(), request.getStock(), request.getStatus());

        int stock = request.getStock() != null ? request.getStock() : 0;
        // ✅ AUTO: stock = 0 khi tạo → tự động INACTIVE
        String status = (request.getStatus() == null || request.getStatus().trim().isEmpty())
                ? (stock == 0 ? "INACTIVE" : "ACTIVE")
                : request.getStatus();

        ContactLens contactLens = ContactLens.builder()
                .name(request.getName())
                .contactType(request.getContactType())
                .color(request.getColor())
                .minSph(request.getMinSph())
                .maxSph(request.getMaxSph())
                .minCyl(request.getMinCyl())
                .maxCyl(request.getMaxCyl())
                .imageUrl(request.getImageUrl())
                .price(request.getPrice())
                .stock(stock)
                .status(status)
                .build();
        return repo.save(contactLens);
    }

    @Override
    public ContactLens getContactLens(Integer id) {
        return repo.findById(id).orElseThrow(() ->
                new RuntimeException("Không tìm thấy kính áp tròng"));
    }

    @Override
    public ContactLens updateContactLens(Integer id, UpdateContactLensRequest request) {
        ContactLens contactLens = repo.findById(id).orElseThrow(() ->
                new RuntimeException("Không tìm thấy kính áp tròng"));

        if (request.getName() != null) {
            if (request.getName().trim().isEmpty())
                throw new RuntimeException("Tên kính áp tròng không được để trống");
            contactLens.setName(request.getName());
        }
        if (request.getContactType() != null) {
            if (!request.getContactType().equals("DAILY") && !request.getContactType().equals("MONTHLY")
                    && !request.getContactType().equals("YEARLY"))
                throw new RuntimeException("Loại kính áp tròng chỉ được là DAILY, MONTHLY hoặc YEARLY");
            contactLens.setContactType(request.getContactType());
        }
        if (request.getColor() != null) contactLens.setColor(request.getColor());

        BigDecimal newMinSph = request.getMinSph() != null ? request.getMinSph() : contactLens.getMinSph();
        BigDecimal newMaxSph = request.getMaxSph() != null ? request.getMaxSph() : contactLens.getMaxSph();
        BigDecimal newMinCyl = request.getMinCyl() != null ? request.getMinCyl() : contactLens.getMinCyl();
        BigDecimal newMaxCyl = request.getMaxCyl() != null ? request.getMaxCyl() : contactLens.getMaxCyl();

        if (newMinSph != null && newMaxSph != null && newMinSph.compareTo(newMaxSph) > 0)
            throw new RuntimeException("minSph phải nhỏ hơn hoặc bằng maxSph");
        if (newMinCyl != null && newMaxCyl != null && newMinCyl.compareTo(newMaxCyl) > 0)
            throw new RuntimeException("minCyl phải nhỏ hơn hoặc bằng maxCyl");

        if (request.getMinSph() != null) contactLens.setMinSph(request.getMinSph());
        if (request.getMaxSph() != null) contactLens.setMaxSph(request.getMaxSph());
        if (request.getMinCyl() != null) contactLens.setMinCyl(request.getMinCyl());
        if (request.getMaxCyl() != null) contactLens.setMaxCyl(request.getMaxCyl());
        if (request.getImageUrl() != null) contactLens.setImageUrl(request.getImageUrl());

        if (request.getPrice() != null) {
            if (request.getPrice().compareTo(BigDecimal.ZERO) <= 0)
                throw new RuntimeException("Giá phải lớn hơn 0");
            contactLens.setPrice(request.getPrice());
        }
        if (request.getStock() != null) {
            if (request.getStock() < 0)
                throw new RuntimeException("Số lượng tồn kho phải lớn hơn hoặc = 0");
            contactLens.setStock(request.getStock());
        }

        // ✅ AUTO: ưu tiên admin chỉnh thủ công, fallback theo stock
        if (request.getStatus() != null) {
            if (!request.getStatus().equals("ACTIVE") && !request.getStatus().equals("INACTIVE"))
                throw new RuntimeException("Trạng thái chỉ được là ACTIVE hoặc INACTIVE");
            contactLens.setStatus(request.getStatus());
        } else {
            int currentStock = contactLens.getStock() != null ? contactLens.getStock() : 0;
            if (currentStock == 0) {
                contactLens.setStatus("INACTIVE");
            } else if (currentStock > 0 && "INACTIVE".equals(contactLens.getStatus())) {
                contactLens.setStatus("ACTIVE");
            }
        }

        return repo.save(contactLens);
    }

    @Override
    public void deleteContactLens(Integer id) {
        if (!repo.existsById(id)) throw new RuntimeException("Không tìm thấy kính áp tròng");
        repo.deleteById(id);
    }

    @Override
    public List<ContactLens> getAllContactLens() {
        return repo.findAll();
    }

    @Override
    public List<ContactLens> searchContactLens(String name, String contactType, String brand,
                                               String color, BigDecimal targetSph, BigDecimal targetCyl,
                                               String status, BigDecimal minPrice, BigDecimal maxPrice) {
        return repo.findAll().stream()
                .filter(i -> name == null || (i.getName() != null && i.getName().toLowerCase().contains(name.toLowerCase())))
                .filter(i -> brand == null || (i.getBrand() != null && i.getBrand().toLowerCase().contains(brand.toLowerCase())))
                .filter(i -> contactType == null || (i.getContactType() != null && i.getContactType().equalsIgnoreCase(contactType)))
                .filter(i -> color == null || (i.getColor() != null && i.getColor().toLowerCase().contains(color.toLowerCase())))
                .filter(i -> targetSph == null || (i.getMinSph() != null && i.getMaxSph() != null && targetSph.compareTo(i.getMinSph()) >= 0 && targetSph.compareTo(i.getMaxSph()) <= 0))
                .filter(i -> targetCyl == null || (i.getMinCyl() != null && i.getMaxCyl() != null && targetCyl.compareTo(i.getMinCyl()) >= 0 && targetCyl.compareTo(i.getMaxCyl()) <= 0))
                .filter(i -> status == null || (i.getStatus() != null && i.getStatus().equalsIgnoreCase(status)))
                .filter(i -> minPrice == null || (i.getPrice() != null && i.getPrice().compareTo(minPrice) >= 0))
                .filter(i -> maxPrice == null || (i.getPrice() != null && i.getPrice().compareTo(maxPrice) <= 0))
                .toList();
    }

    private void ValidateContactLens(String name, String contactType, BigDecimal minSph,
                                     BigDecimal maxSph, BigDecimal minCyl, BigDecimal maxCyl,
                                     BigDecimal price, Integer stock, String status) {
        if (name == null || name.isEmpty()) throw new RuntimeException("Tên kính áp tròng không được để trống");
        if (contactType != null && !contactType.equals("DAILY") && !contactType.equals("MONTHLY") && !contactType.equals("YEARLY"))
            throw new RuntimeException("Loại kính áp tròng chỉ được là DAILY, MONTHLY hoặc YEARLY");
        if (minSph != null && maxSph != null && minSph.compareTo(maxSph) > 0)
            throw new RuntimeException("minSph phải nhỏ hơn hoặc bằng maxSph");
        if (minCyl != null && maxCyl != null && minCyl.compareTo(maxCyl) > 0)
            throw new RuntimeException("minCyl phải nhỏ hơn hoặc bằng maxCyl");
        if (price != null && price.compareTo(BigDecimal.ZERO) <= 0)
            throw new RuntimeException("Giá phải lớn hơn hoặc bằng 0");
        if (stock != null && stock < 0)
            throw new RuntimeException("Số lượng tồn kho phải lớn hơn hoặc bằng 0");
        if (status != null && !status.equals("ACTIVE") && !status.equals("INACTIVE"))
            throw new RuntimeException("Trạng thái chỉ được là ACTIVE hoặc INACTIVE");
    }
}