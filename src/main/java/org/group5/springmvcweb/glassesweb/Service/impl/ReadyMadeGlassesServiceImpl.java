package org.group5.springmvcweb.glassesweb.Service.impl;

import org.group5.springmvcweb.glassesweb.DTO.CreateReadyMadeGlassesRequest;
import org.group5.springmvcweb.glassesweb.DTO.UpdateReadyMadeGlassesRequest;
import org.group5.springmvcweb.glassesweb.Entity.Frame;
import org.group5.springmvcweb.glassesweb.Entity.Lens;
import org.group5.springmvcweb.glassesweb.Entity.ReadyMadeGlasses;
import org.group5.springmvcweb.glassesweb.Repository.FrameRepository;
import org.group5.springmvcweb.glassesweb.Repository.LensRepository;
import org.group5.springmvcweb.glassesweb.Repository.ReadyMadeGlassesRepository;
import org.group5.springmvcweb.glassesweb.Service.ReadyMadeGlassesService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ReadyMadeGlassesServiceImpl implements ReadyMadeGlassesService {

    private final ReadyMadeGlassesRepository readyMadeGlassesRepository;
    private final FrameRepository frameRepository;
    private final LensRepository lensRepository;

    public ReadyMadeGlassesServiceImpl(ReadyMadeGlassesRepository readyMadeGlassesRepository,
                                       FrameRepository frameRepository,
                                       LensRepository lensRepository) {
        this.readyMadeGlassesRepository = readyMadeGlassesRepository;
        this.frameRepository = frameRepository;
        this.lensRepository = lensRepository;
    }

    @Override
    public List<ReadyMadeGlasses> search(String name, String status,
                                         BigDecimal minPrice, BigDecimal maxPrice) {
        return readyMadeGlassesRepository.findAll().stream()
                .filter(item -> name == null
                        || (item.getName() != null
                        && item.getName().toLowerCase().contains(name.toLowerCase())))
                .filter(item -> status == null
                        || (item.getStatus() != null
                        && item.getStatus().equalsIgnoreCase(status)))
                .filter(item -> minPrice == null
                        || (item.getPrice() != null
                        && item.getPrice().compareTo(minPrice) >= 0))
                .filter(item -> maxPrice == null
                        || (item.getPrice() != null
                        && item.getPrice().compareTo(maxPrice) <= 0))
                .toList();
    }

    @Override
    public ReadyMadeGlasses create(CreateReadyMadeGlassesRequest request) {
        Frame frame = frameRepository.findById(request.getFrameId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gọng kính với id " + request.getFrameId()));

        Lens lens = lensRepository.findById(request.getLensId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tròng kính với id " + request.getLensId()));

        validateReadyMadeGlassesData(
                request.getName(),
                request.getFixedSph(),
                request.getFixedCyl(),
                request.getPrice(),
                request.getStock(),
                request.getStatus(),
                lens
        );

        int stock = request.getStock() != null ? request.getStock() : 0;
        // ✅ AUTO: stock = 0 khi tạo mới → tự động INACTIVE
        String status = (request.getStatus() == null || request.getStatus().trim().isEmpty())
                ? (stock == 0 ? "INACTIVE" : "ACTIVE")
                : request.getStatus().trim().toUpperCase();

        ReadyMadeGlasses readyMadeGlasses = ReadyMadeGlasses.builder()
                .name(request.getName().trim())
                .frameId(frame.getFrameId())
                .lensId(lens.getLensId())
                .fixedSph(request.getFixedSph())
                .fixedCyl(request.getFixedCyl())
                .imageUrl(request.getImageUrl())
                .price(request.getPrice())
                .stock(stock)
                .status(status)
                .build();

        return readyMadeGlassesRepository.save(readyMadeGlasses);
    }

    @Override
    public ReadyMadeGlasses getById(Integer id) {
        return readyMadeGlassesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kính có sẵn với id " + id));
    }

    @Override
    public List<ReadyMadeGlasses> getAll() {
        return readyMadeGlassesRepository.findAll();
    }

    @Override
    public ReadyMadeGlasses update(Integer id, UpdateReadyMadeGlassesRequest request) {
        ReadyMadeGlasses entity = readyMadeGlassesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kính có sẵn với id " + id));

        Integer newFrameId = request.getFrameId() != null ? request.getFrameId() : entity.getFrameId();
        Integer newLensId = request.getLensId() != null ? request.getLensId() : entity.getLensId();

        Frame frame = frameRepository.findById(newFrameId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gọng kính với id " + newFrameId));

        Lens lens = lensRepository.findById(newLensId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tròng kính với id " + newLensId));

        String newName = request.getName() != null ? request.getName() : entity.getName();
        BigDecimal newFixedSph = request.getFixedSph() != null ? request.getFixedSph() : entity.getFixedSph();
        BigDecimal newFixedCyl = request.getFixedCyl() != null ? request.getFixedCyl() : entity.getFixedCyl();
        BigDecimal newPrice = request.getPrice() != null ? request.getPrice() : entity.getPrice();
        Integer newStock = request.getStock() != null ? request.getStock() : entity.getStock();

        // ✅ AUTO: nếu admin không chỉ định status mà stock về 0 → tự INACTIVE
        //         nếu admin không chỉ định status mà stock > 0 và đang INACTIVE → tự ACTIVE lại
        String newStatus;
        if (request.getStatus() != null) {
            // Admin chỉnh thủ công → ưu tiên giá trị admin truyền vào
            newStatus = request.getStatus().trim().toUpperCase();
        } else if (newStock == 0) {
            newStatus = "INACTIVE";
        } else if (newStock > 0 && "INACTIVE".equals(entity.getStatus())) {
            newStatus = "ACTIVE";
        } else {
            newStatus = entity.getStatus();
        }

        validateReadyMadeGlassesData(newName, newFixedSph, newFixedCyl, newPrice, newStock, newStatus, lens);

        entity.setName(newName.trim());
        entity.setFrameId(frame.getFrameId());
        entity.setLensId(lens.getLensId());
        entity.setFixedSph(newFixedSph);
        entity.setFixedCyl(newFixedCyl);
        entity.setPrice(newPrice);
        entity.setStock(newStock);
        entity.setStatus(newStatus);

        if (request.getImageUrl() != null) {
            entity.setImageUrl(request.getImageUrl());
        }

        return readyMadeGlassesRepository.save(entity);
    }

    @Override
    public void delete(Integer id) {
        if (!readyMadeGlassesRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy kính có sẵn với id " + id);
        }
        readyMadeGlassesRepository.deleteById(id);
    }

    private void validateReadyMadeGlassesData(String name,
                                              BigDecimal fixedSph,
                                              BigDecimal fixedCyl,
                                              BigDecimal price,
                                              Integer stock,
                                              String status,
                                              Lens lens) {
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Tên kính có sẵn không được để trống");
        }
        if (price == null) {
            throw new RuntimeException("Giá không được để trống");
        }
        if (price.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Giá phải lớn hơn hoặc bằng 0");
        }
        if (stock != null && stock < 0) {
            throw new RuntimeException("Số lượng tồn kho phải lớn hơn hoặc bằng 0");
        }
        if (status != null) {
            String s = status.trim().toUpperCase();
            if (!s.equals("ACTIVE") && !s.equals("INACTIVE")) {
                throw new RuntimeException("Trạng thái chỉ được là ACTIVE hoặc INACTIVE");
            }
        }
        if (lens.getLensType() != null && lens.getLensType().equalsIgnoreCase("CONTACT_LENS")) {
            throw new RuntimeException("Không thể dùng contact lens cho kính có sẵn");
        }
    }
}