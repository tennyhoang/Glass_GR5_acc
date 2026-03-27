package org.group5.springmvcweb.glassesweb.Service.impl;

import org.group5.springmvcweb.glassesweb.DTO.CreateLensRequest;
import org.group5.springmvcweb.glassesweb.DTO.UpdateLensRequest;
import org.group5.springmvcweb.glassesweb.Entity.Lens;
import org.group5.springmvcweb.glassesweb.Repository.LensRepository;
import org.group5.springmvcweb.glassesweb.Service.LensService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class LensServiceImpl implements LensService {

    private final LensRepository lensRepository;

    public LensServiceImpl(LensRepository lensRepository) {
        this.lensRepository = lensRepository;
    }

    @Override
    public Lens createLens(CreateLensRequest request) {
        validateLensData(request.getName(), request.getLensType(), request.getColorChange(),
                request.getLensSize(), request.getMinSph(), request.getMaxSph(),
                request.getBasePrice(), request.getStock(), request.getStatus());

        int stock = request.getStock() != null ? request.getStock() : 0;
        // ✅ AUTO: stock = 0 khi tạo → tự động INACTIVE
        String status = (request.getStatus() == null || request.getStatus().trim().isEmpty())
                ? (stock == 0 ? "INACTIVE" : "ACTIVE")
                : request.getStatus();

        Lens lens = Lens.builder()
                .name(request.getName())
                .brand(request.getBrand())
                .lensType(request.getLensType())
                .colorChange(request.getColorChange())
                .lensSize(request.getLensSize())
                .minSph(request.getMinSph())
                .maxSph(request.getMaxSph())
                .imageUrl(request.getImageUrl())
                .basePrice(request.getBasePrice())
                .stock(stock)
                .status(status)
                .build();

        return lensRepository.save(lens);
    }

    @Override
    public Lens getLensById(Integer id) {
        return lensRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tròng kính"));
    }

    @Override
    public List<Lens> getAllLens() {
        return lensRepository.findAll();
    }

    @Override
    public Lens updateLens(Integer id, UpdateLensRequest request) {
        Lens lens = lensRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tròng kính"));

        if (request.getName() != null) {
            if (request.getName().trim().isEmpty()) throw new RuntimeException("Tên tròng kính không được để trống");
            lens.setName(request.getName());
        }
        if (request.getBrand() != null) lens.setBrand(request.getBrand());
        if (request.getLensType() != null) {
            if (!request.getLensType().equals("SINGLE_VISION") && !request.getLensType().equals("PROGRESSIVE")
                    && !request.getLensType().equals("BIFOCAL") && !request.getLensType().equals("SUNGLASSES"))
                throw new RuntimeException("Loại tròng không hợp lệ");
            lens.setLensType(request.getLensType());
        }
        if (request.getColorChange() != null) lens.setColorChange(request.getColorChange());
        if (request.getLensSize() != null) {
            if (!request.getLensSize().equals("S") && !request.getLensSize().equals("M") && !request.getLensSize().equals("L"))
                throw new RuntimeException("Kích thước tròng chỉ được là S, M hoặc L");
            lens.setLensSize(request.getLensSize());
        }

        BigDecimal newMinSph = request.getMinSph() != null ? request.getMinSph() : lens.getMinSph();
        BigDecimal newMaxSph = request.getMaxSph() != null ? request.getMaxSph() : lens.getMaxSph();
        if (newMinSph != null && newMaxSph != null && newMinSph.compareTo(newMaxSph) > 0)
            throw new RuntimeException("minSph phải nhỏ hơn hoặc bằng maxSph");
        if (request.getMinSph() != null) lens.setMinSph(request.getMinSph());
        if (request.getMaxSph() != null) lens.setMaxSph(request.getMaxSph());
        if (request.getImageUrl() != null) lens.setImageUrl(request.getImageUrl());

        if (request.getBasePrice() != null) {
            if (request.getBasePrice().compareTo(BigDecimal.ZERO) < 0)
                throw new RuntimeException("Giá cơ bản phải lớn hơn hoặc bằng 0");
            lens.setBasePrice(request.getBasePrice());
        }
        if (request.getStock() != null) {
            if (request.getStock() < 0) throw new RuntimeException("Số lượng tồn kho phải lớn hơn hoặc bằng 0");
            lens.setStock(request.getStock());
        }

        // ✅ AUTO: ưu tiên admin chỉnh thủ công, fallback theo stock
        if (request.getStatus() != null) {
            if (!request.getStatus().equals("ACTIVE") && !request.getStatus().equals("INACTIVE"))
                throw new RuntimeException("Trạng thái chỉ được là ACTIVE hoặc INACTIVE");
            lens.setStatus(request.getStatus());
        } else {
            int currentStock = lens.getStock() != null ? lens.getStock() : 0;
            if (currentStock == 0) {
                lens.setStatus("INACTIVE");
            } else if (currentStock > 0 && "INACTIVE".equals(lens.getStatus())) {
                lens.setStatus("ACTIVE");
            }
        }

        return lensRepository.save(lens);
    }

    @Override
    public void deleteLens(Integer id) {
        if (!lensRepository.existsById(id)) throw new RuntimeException("Không tìm thấy tròng kính");
        lensRepository.deleteById(id);
    }

    private void validateLensData(String name, String lensType, Boolean colorChange, String lensSize,
                                  BigDecimal minSph, BigDecimal maxSph, BigDecimal basePrice,
                                  Integer stock, String status) {
        if (name == null || name.trim().isEmpty()) throw new RuntimeException("Tên tròng kính không được để trống");
        if (lensType != null && !lensType.equals("SINGLE_VISION") && !lensType.equals("PROGRESSIVE")
                && !lensType.equals("BIFOCAL") && !lensType.equals("SUNGLASSES"))
            throw new RuntimeException("Loại tròng không hợp lệ");
        if (lensSize != null && !lensSize.equals("S") && !lensSize.equals("M") && !lensSize.equals("L"))
            throw new RuntimeException("Kích thước tròng chỉ được là S, M hoặc L");
        if (minSph != null && maxSph != null && minSph.compareTo(maxSph) > 0)
            throw new RuntimeException("minSph phải nhỏ hơn hoặc bằng maxSph");
        if (basePrice != null && basePrice.compareTo(BigDecimal.ZERO) < 0)
            throw new RuntimeException("Giá cơ bản phải lớn hơn hoặc bằng 0");
        if (stock != null && stock < 0) throw new RuntimeException("Số lượng tồn kho phải lớn hơn hoặc bằng 0");
        if (status != null && !status.equals("ACTIVE") && !status.equals("INACTIVE"))
            throw new RuntimeException("Trạng thái chỉ được là ACTIVE hoặc INACTIVE");
    }

    @Override
    public List<Lens> searchLens(String name, String brand, String lensType, Boolean colorChange,
                                 String lensSize, BigDecimal targetSph, String status,
                                 BigDecimal minPrice, BigDecimal maxPrice) {
        return lensRepository.findAll().stream()
                .filter(l -> name == null || (l.getName() != null && l.getName().toLowerCase().contains(name.toLowerCase())))
                .filter(l -> brand == null || (l.getBrand() != null && l.getBrand().toLowerCase().contains(brand.toLowerCase())))
                .filter(l -> lensType == null || (l.getLensType() != null && l.getLensType().equalsIgnoreCase(lensType)))
                .filter(l -> colorChange == null || (l.getColorChange() != null && l.getColorChange().equals(colorChange)))
                .filter(l -> lensSize == null || (l.getLensSize() != null && l.getLensSize().equalsIgnoreCase(lensSize)))
                .filter(l -> targetSph == null || (l.getMinSph() != null && l.getMaxSph() != null && targetSph.compareTo(l.getMinSph()) >= 0 && targetSph.compareTo(l.getMaxSph()) <= 0))
                .filter(l -> status == null || (l.getStatus() != null && l.getStatus().equalsIgnoreCase(status)))
                .filter(l -> minPrice == null || (l.getBasePrice() != null && l.getBasePrice().compareTo(minPrice) >= 0))
                .filter(l -> maxPrice == null || (l.getBasePrice() != null && l.getBasePrice().compareTo(maxPrice) <= 0))
                .toList();
    }
}