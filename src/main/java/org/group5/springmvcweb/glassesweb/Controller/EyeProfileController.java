package org.group5.springmvcweb.glassesweb.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Service.EyeProfileService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.group5.springmvcweb.glassesweb.security.UserPrincipal;
import java.util.List;

/**
 * EyeProfile Controller
 *
 * Base URL: /api/eye-profiles
 *
 * Endpoints:
 *   [CUSTOMER]
 *   POST   /api/eye-profiles/manual          → Tạo hồ sơ mắt nhập tay (JSON)
 *   POST   /api/eye-profiles/upload          → Tạo hồ sơ mắt bằng file ảnh/pdf (multipart)
 *   GET    /api/eye-profiles/me              → Xem danh sách hồ sơ mắt của mình
 *   GET    /api/eye-profiles/{id}            → Xem chi tiết một hồ sơ
 *   PATCH  /api/eye-profiles/{id}/deactivate → Vô hiệu hoá hồ sơ
 *
 *   [STAFF / ADMIN]
 *   GET    /api/eye-profiles/customer/{customerId} → Xem hồ sơ của bất kỳ customer
 */
@RestController
@RequestMapping("/api/eye-profiles")
@RequiredArgsConstructor
public class EyeProfileController {

    private final EyeProfileService eyeProfileService;

    // --------------------------------------------------
    // CUSTOMER: Tạo hồ sơ mắt nhập tay (JSON body)
    // --------------------------------------------------
    @PostMapping("/manual")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<EyeProfileResponse>> createManual(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody EyeProfileManualRequest request) {

        EyeProfileResponse response = eyeProfileService.createManual(
                currentUser.getCustomerId(), request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo hồ sơ mắt thành công", response));
    }

    // --------------------------------------------------
    // CUSTOMER: Tạo hồ sơ mắt bằng upload file ảnh/pdf
    //
    // Content-Type: multipart/form-data
    // Form fields:
    //   - profileName (String, bắt buộc) : tên hồ sơ
    //   - file        (File, bắt buộc)   : ảnh .jpg/.png hoặc .pdf đơn thuốc
    // --------------------------------------------------
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<EyeProfileResponse>> createByUpload(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("profileName") String profileName,
            @RequestParam("file") MultipartFile file) {

        // Validate tên hồ sơ
        if (profileName == null || profileName.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.fail("Vui lòng đặt tên cho hồ sơ mắt"));
        }
        if (profileName.length() > 255) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.fail("Tên hồ sơ không được quá 255 ký tự"));
        }

        // Validate file không rỗng
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.fail("Vui lòng chọn file để upload"));
        }

        // Validate loại file: chỉ chấp nhận .jpg, .jpeg, .png, .pdf
        String contentType = file.getContentType();
        boolean isAllowed = contentType != null && (
                contentType.equals("image/jpeg") ||
                        contentType.equals("image/png")  ||
                        contentType.equals("application/pdf")
        );
        if (!isAllowed) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.fail("Chỉ chấp nhận file .jpg, .png hoặc .pdf"));
        }

        EyeProfileResponse response = eyeProfileService.createByUpload(
                currentUser.getCustomerId(), profileName.trim(), file);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Upload hồ sơ mắt thành công", response));
    }

    // --------------------------------------------------
    // CUSTOMER: Xem danh sách hồ sơ mắt của mình
    // --------------------------------------------------
    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<EyeProfileResponse>>> getMyProfiles(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        List<EyeProfileResponse> profiles = eyeProfileService.getMyProfiles(
                currentUser.getCustomerId());

        return ResponseEntity.ok(ApiResponse.ok(profiles));
    }

    // --------------------------------------------------
    // CUSTOMER: Xem chi tiết một hồ sơ mắt
    // --------------------------------------------------
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<EyeProfileResponse>> getProfileDetail(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Integer id) {

        EyeProfileResponse response = eyeProfileService.getProfileDetail(
                currentUser.getCustomerId(), id);

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // --------------------------------------------------
    // CUSTOMER: Vô hiệu hoá hồ sơ mắt
    // --------------------------------------------------
    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<EyeProfileResponse>> deactivate(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Integer id) {

        EyeProfileResponse response = eyeProfileService.deactivateProfile(
                currentUser.getCustomerId(), id);

        return ResponseEntity.ok(ApiResponse.ok("Đã vô hiệu hoá hồ sơ mắt", response));
    }

    // --------------------------------------------------
    // STAFF / ADMIN: Xem hồ sơ mắt của bất kỳ customer
    // --------------------------------------------------
    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<EyeProfileResponse>>> getByCustomer(
            @PathVariable Integer customerId) {

        List<EyeProfileResponse> profiles = eyeProfileService.getProfilesByCustomerId(customerId);

        return ResponseEntity.ok(ApiResponse.ok(profiles));
    }
}