package org.group5.springmvcweb.glassesweb.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CartItemResponse {
    private Integer cartItemId;
    private String productType;
    private Integer productId;
    private String productName;
    private Integer quantity;
    private Double price;
}