package org.group5.springmvcweb.glassesweb.Service.impl;

import org.group5.springmvcweb.glassesweb.DTO.CreateDiscountRequest;
import org.group5.springmvcweb.glassesweb.DTO.UpdateDiscountRequest;
import org.group5.springmvcweb.glassesweb.Repository.DiscountRepository;
import org.group5.springmvcweb.glassesweb.Service.DiscountService;
import org.group5.springmvcweb.glassesweb.Entity.Discount;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DiscountServiceImpl implements DiscountService {

    private final DiscountRepository repo;

    public DiscountServiceImpl(DiscountRepository repo) {
        this.repo = repo;
    }

    @Override
    public Discount create(CreateDiscountRequest request) {
        validateDiscount(
                request.getDiscountType(),
                request.getDiscountValue(),
                request.getMinQuantity() != null ? request.getMinQuantity() : 1,
                request.getMinOrderAmount(),
                request.getStartDate(),
                request.getEndDate(),
                request.getStatus() == null || request.getStatus().trim().isEmpty()
                        ? "ACTIVE" : request.getStatus().trim().toUpperCase()
        );
        if(repo.existsByCode(request.getCode().trim())){
            throw new RuntimeException("Code đã tồn tại");
        }
        Discount discount = Discount.builder()
                .code(request.getCode().trim())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minQuantity(request.getMinQuantity())
                .minOrderAmount(request.getMinOrderAmount())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus())
                .build();
        return  repo.save(discount);
    }

    @Override
    public Discount getById(Integer id) {
        return repo.findById(id).orElseThrow(()->
                new RuntimeException("id không tồn tại"));
    }

    @Override
    public List<Discount> getAll() {
        return repo.findAll();
    }

    @Override
    public Discount update(Integer id, UpdateDiscountRequest request) {
        Discount discount = repo.findById(id).orElseThrow(()->
                new RuntimeException("Discount không tồn tại"));

        if(request.getCode()!=null){
            if(request.getCode().trim().isEmpty()){
                throw new RuntimeException("Code không được để trống");
            }
            if(repo.existsByCodeAndDiscountIdNot(request.getCode().trim(), id)){
                throw new RuntimeException("Code đã tồn tại");
            }
            discount.setCode(request.getCode());
        }
        if (request.getDiscountType() != null) {
            if (!request.getDiscountType().equalsIgnoreCase("COUPON")
                    && !request.getDiscountType().equalsIgnoreCase("QUANTITY")) {
                throw new RuntimeException("Discount type chỉ được là COUPON hoặc QUANTITY");
            }
            discount.setDiscountType(request.getDiscountType().trim().toUpperCase());
        }

        if (request.getDiscountValue() != null) {
            if (request.getDiscountValue().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("Discount value phải lớn hơn 0");
            }
            discount.setDiscountValue(request.getDiscountValue());
        }

        if (request.getMinQuantity() != null) {
            if (request.getMinQuantity() < 1) {
                throw new RuntimeException("Min quantity phải lớn hơn hoặc bằng 1");
            }
            discount.setMinQuantity(request.getMinQuantity());
        }

        if (request.getMinOrderAmount() != null) {
            if (request.getMinOrderAmount().compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Min order amount không được âm");
            }
            discount.setMinOrderAmount(request.getMinOrderAmount());
        }

        if (request.getStartDate() != null) {
            discount.setStartDate(request.getStartDate());
        }

        if (request.getEndDate() != null) {
            discount.setEndDate(request.getEndDate());
        }

        if (request.getStatus() != null) {
            if (!request.getStatus().equalsIgnoreCase("ACTIVE")
                    && !request.getStatus().equalsIgnoreCase("INACTIVE")) {
                throw new RuntimeException("Trạng thái chỉ được là ACTIVE hoặc INACTIVE");
            }
            discount.setStatus(request.getStatus().trim().toUpperCase());
        }

        if (discount.getStartDate() != null && discount.getEndDate() != null
                && discount.getEndDate().isBefore(discount.getStartDate())) {
            throw new RuntimeException("End date phải lớn hơn hoặc bằng start date");
        }

        return repo.save(discount);

    }

    @Override
    public void delete(Integer id) {
        if(!repo.existsById(id)){
            throw new RuntimeException("Discount không tồn tại");
        }
        repo.deleteById(id);
    }

    // Phương thức validate cho create
    private void validateDiscount(String discountType,
                                  BigDecimal discountValue,
                                  Integer minQuantity,
                                  BigDecimal minOrderAmount,
                                  java.time.LocalDateTime startDate,
                                  java.time.LocalDateTime endDate,
                                  String status) {

        if (!discountType.equalsIgnoreCase("COUPON") &&
                !discountType.equalsIgnoreCase("QUANTITY")) {
            throw new RuntimeException("Discount type chỉ được là COUPON hoặc QUANTITY");
        }

        if (!status.equalsIgnoreCase("ACTIVE") &&
                !status.equalsIgnoreCase("INACTIVE")) {
            throw new RuntimeException("Status chỉ được là ACTIVE hoặc INACTIVE");
        }

        if (discountValue.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Discount value phải lớn hơn 0");
        }

        if (minQuantity < 1) {
            throw new RuntimeException("Min quantity phải lớn hơn hoặc bằng 1");
        }

        if (minOrderAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Min order amount không được âm");
        }

        if (startDate == null || endDate == null) {
            throw new RuntimeException("Start date và end date không được để trống");
        }

        if (endDate.isBefore(startDate)) {
            throw new RuntimeException("End date phải lớn hơn hoặc bằng start date");
        }
    }

    // ===== PHƯƠNG THỨC MỚI =====
    @Override
    public Discount validateDiscount(String discountCode, Double orderTotalAmount) {
        // 1. Tìm discount theo code
        Discount discount = repo.findByCode(discountCode)
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại!"));

        LocalDateTime now = LocalDateTime.now();

        // 2. Kiểm tra ngày hết hạn → nếu hết, cập nhật trạng thái và ném lỗi
        if (discount.getEndDate() != null && now.isAfter(discount.getEndDate())) {
            discount.setStatus("INACTIVE");
            repo.save(discount);
            throw new RuntimeException("Mã giảm giá đã hết hạn!");
        }

        // 3. Kiểm tra ngày bắt đầu
        if (discount.getStartDate() != null && now.isBefore(discount.getStartDate())) {
            throw new RuntimeException("Mã giảm giá chưa có hiệu lực!");
        }

        // 4. Kiểm tra trạng thái hoạt động
        if (!"ACTIVE".equals(discount.getStatus())) {
            throw new RuntimeException("Mã giảm giá không được kích hoạt!");
        }

        // 5. Kiểm tra điều kiện đơn hàng tối thiểu
        if (discount.getMinOrderAmount() != null &&
                orderTotalAmount < discount.getMinOrderAmount().doubleValue()) {
            throw new RuntimeException("Đơn hàng tối thiểu " +
                    discount.getMinOrderAmount().setScale(0, BigDecimal.ROUND_DOWN) +
                    "đ để sử dụng mã này!");
        }

        // Nếu tất cả hợp lệ, trả về discount để dùng tính toán
        return discount;
    }
}