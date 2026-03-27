package org.group5.springmvcweb.glassesweb.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class CartResponse {
    private Integer cartId;
    private List<CartItemResponse> items;
    private Double totalAmount;
}