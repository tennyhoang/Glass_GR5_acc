package org.group5.springmvcweb.glassesweb.Service;

import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Entity.*;
import org.group5.springmvcweb.glassesweb.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired private CartRepository cartRepository;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private AccountRepository accountRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private ReadyMadeGlassesRepository readyMadeGlassesRepository;
    @Autowired private MyGlassesRepository myGlassesRepository;
    @Autowired private ContactLensRepository contactLensRepository;

    // ✅ Thêm 2 repository mới
    @Autowired private FrameRepository frameRepository;
    @Autowired private LensRepository lensRepository;

    private Cart getOrCreateCart(String username) {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found!"));
        return cartRepository.findByCustomerId(account.getCustomerId())
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setCustomerId(account.getCustomerId());
                    return cartRepository.save(cart);
                });
    }

    @Transactional
    public CartResponse getCart(String username) {
        Cart cart = getOrCreateCart(username);
        List<CartItem> items = cartItemRepository.findByCartId(cart.getCartId());

        List<CartItemResponse> itemResponses = items.stream()
                .map(item -> new CartItemResponse(
                        item.getCartItemId(),
                        item.getProductType(),
                        item.getProductId(),
                        getProductName(item.getProductType(), item.getProductId()),
                        item.getQuantity(),
                        getProductPrice(item.getProductType(), item.getProductId())
                ))
                .collect(Collectors.toList());

        Double totalAmount = itemResponses.stream()
                .mapToDouble(i -> i.getPrice() * i.getQuantity())
                .sum();

        return new CartResponse(cart.getCartId(), itemResponses, totalAmount);
    }

    @Transactional
    public void addToCart(String username, CartItemRequest request) {
        Cart cart = getOrCreateCart(username);
        validateProduct(request.getProductType(), request.getProductId());

        // ✅ Kiểm tra tồn kho trước khi thêm
        checkStock(request.getProductType(), request.getProductId(), request.getQuantity());

        List<CartItem> existingItems = cartItemRepository.findByCartId(cart.getCartId());
        CartItem existingItem = existingItems.stream()
                .filter(i -> i.getProductType().equals(request.getProductType())
                        && i.getProductId().equals(request.getProductId()))
                .findFirst().orElse(null);

        if (existingItem != null) {
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            // Kiểm tra lại tổng số lượng trong giỏ không vượt quá stock
            checkStock(request.getProductType(), request.getProductId(), newQuantity);
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem cartItem = new CartItem();
            cartItem.setCartId(cart.getCartId());
            cartItem.setProductType(request.getProductType());
            cartItem.setProductId(request.getProductId());
            cartItem.setQuantity(request.getQuantity());
            cartItemRepository.save(cartItem);
        }
    }

    @Transactional
    public void updateQuantity(String username, Integer cartItemId, Integer quantity) {
        Cart cart = getOrCreateCart(username);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("CartItem not found!"));
        if (!cartItem.getCartId().equals(cart.getCartId()))
            throw new RuntimeException("You are not authorized to do this!");
        if (quantity <= 0) { cartItemRepository.delete(cartItem); return; }

        // Kiểm tra tồn kho khi cập nhật số lượng
        checkStock(cartItem.getProductType(), cartItem.getProductId(), quantity);

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);
    }

    @Transactional
    public void removeFromCart(String username, Integer cartItemId) {
        Cart cart = getOrCreateCart(username);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("CartItem not found!"));
        if (!cartItem.getCartId().equals(cart.getCartId()))
            throw new RuntimeException("You are not authorized to do this!");
        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart(Integer cartId) {
        cartItemRepository.deleteByCartId(cartId);
    }

    // ✅ Hàm kiểm tra tồn kho
    private void checkStock(String productType, Integer productId, int requestedQty) {
        int currentStock = 0;
        switch (productType) {
            case "READY_MADE":
                currentStock = readyMadeGlassesRepository.findById(productId)
                        .map(ReadyMadeGlasses::getStock).orElse(0);
                break;
            case "CONTACT_LENS":
                currentStock = contactLensRepository.findById(productId)
                        .map(ContactLens::getStock).orElse(0);
                break;
            case "FRAME":
                currentStock = frameRepository.findById(productId)
                        .map(Frame::getStock).orElse(0);
                break;
            case "LENS":
                currentStock = lensRepository.findById(productId)
                        .map(Lens::getStock).orElse(0);
                break;
            case "MY_GLASSES":
                // Kính thiết kế riêng, không cần kiểm tra stock vì sản xuất theo đơn
                return;
            default:
                throw new RuntimeException("Loại sản phẩm không hợp lệ!");
        }
        if (requestedQty > currentStock) {
            throw new RuntimeException("Sản phẩm hiện chỉ còn " + currentStock + " cái, bạn chỉ có thể mua tối đa " + currentStock + " cái!");
        }
    }

    // ✅ Thêm FRAME và LENS vào getProductName
    private String getProductName(String productType, Integer productId) {
        switch (productType) {
            case "READY_MADE":
                return readyMadeGlassesRepository.findById(productId)
                        .map(p -> p.getName()).orElse("Unknown");
            case "MY_GLASSES":
                return myGlassesRepository.findById(productId)
                        .map(p -> p.getGlassesDesign() != null
                                ? p.getGlassesDesign().getDesignName() : "My Glasses")
                        .orElse("Unknown");
            case "CONTACT_LENS":
                return contactLensRepository.findById(productId)
                        .map(p -> p.getName()).orElse("Unknown");
            case "FRAME":
                return frameRepository.findById(productId)
                        .map(p -> p.getName()).orElse("Unknown");
            case "LENS":
                return lensRepository.findById(productId)
                        .map(p -> p.getName()).orElse("Unknown");
            default:
                return "Unknown";
        }
    }

    // ✅ Thêm FRAME và LENS vào getProductPrice
    private Double getProductPrice(String productType, Integer productId) {
        switch (productType) {
            case "READY_MADE":
                return readyMadeGlassesRepository.findById(productId)
                        .map(p -> p.getPrice().doubleValue()).orElse(0.0);
            case "MY_GLASSES":
                return myGlassesRepository.findById(productId)
                        .map(p -> p.getGlassesDesign() != null
                                ? p.getGlassesDesign().getTotalPrice().doubleValue() : 0.0)
                        .orElse(0.0);
            case "CONTACT_LENS":
                return contactLensRepository.findById(productId)
                        .map(p -> p.getPrice().doubleValue()).orElse(0.0);
            case "FRAME":
                return frameRepository.findById(productId)
                        .map(p -> p.getPrice().doubleValue()).orElse(0.0);
            case "LENS":
                return lensRepository.findById(productId)
                        .map(p -> p.getBasePrice().doubleValue()).orElse(0.0);
            default:
                return 0.0;
        }
    }

    // ✅ Thêm FRAME và LENS vào validateProduct
    private void validateProduct(String productType, Integer productId) {
        List<String> validTypes = List.of(
                "READY_MADE", "MY_GLASSES", "CONTACT_LENS",
                "FRAME", "LENS"
        );
        if (!validTypes.contains(productType)) {
            throw new RuntimeException("Product type not valid: " + productType);
        }
    }
}