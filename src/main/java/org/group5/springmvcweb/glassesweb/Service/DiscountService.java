package org.group5.springmvcweb.glassesweb.Service;

import org.group5.springmvcweb.glassesweb.DTO.CreateDiscountRequest;
import org.group5.springmvcweb.glassesweb.DTO.UpdateDiscountRequest;
import org.group5.springmvcweb.glassesweb.Entity.Discount;

import java.util.List;

public interface DiscountService {
    Discount create(CreateDiscountRequest request);

    Discount getById(Integer id);

    List<Discount> getAll();

    Discount update(Integer id, UpdateDiscountRequest request);

    void delete(Integer id);

    // Thêm method validateDiscount
    Discount validateDiscount(String discountCode, Double orderTotalAmount);
}