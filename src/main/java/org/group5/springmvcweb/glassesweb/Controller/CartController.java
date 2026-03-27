package org.group5.springmvcweb.glassesweb.Controller;

import jakarta.validation.Valid;
import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    // Xem giỏ hàng
    @GetMapping
    public ResponseEntity<CartResponse> getCart(
            Authentication authentication) {
        return ResponseEntity.ok(
                cartService.getCart(authentication.getName()));
    }

    // Thêm sản phẩm vào giỏ
    @PostMapping("/add")
    public ResponseEntity<Map<String, String>> addToCart(
            Authentication authentication,
            @Valid @RequestBody CartItemRequest request) {
        cartService.addToCart(authentication.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Added to cart!"));
    }

    // Xoá sản phẩm khỏi giỏ
    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<Map<String, String>> removeFromCart(
            Authentication authentication,
            @PathVariable Integer cartItemId) {
        cartService.removeFromCart(authentication.getName(), cartItemId);
        return ResponseEntity.ok(Map.of("message", "Removed from cart!"));
    }

    // Cập nhật số lượng sản phẩm
    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<Map<String, String>> updateQuantity(
            Authentication authentication,
            @PathVariable Integer cartItemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        cartService.updateQuantity(
                authentication.getName(),
                cartItemId,
                request.getQuantity());
        return ResponseEntity.ok(Map.of("message", "Cart updated!"));
    }
}