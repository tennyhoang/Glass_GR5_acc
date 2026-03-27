package org.group5.springmvcweb.glassesweb.Controller;

import org.group5.springmvcweb.glassesweb.DTO.*;
import org.group5.springmvcweb.glassesweb.Entity.*;
import org.group5.springmvcweb.glassesweb.Service.*;
import org.group5.springmvcweb.glassesweb.Service.impl.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/search")
public class SearchController {

    @Autowired
    private FrameService frameService;

    @Autowired
    private LensService lensService;

    @Autowired
    private ContactLensService contactLensService;

    @Autowired
    private ReadyMadeGlassesService readyMadeGlassesService;

    // ===== Tìm kiếm tổng hợp =====
    @GetMapping
    public SearchResponse searchAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String size,
            @RequestParam(required = false) String material,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal targetSph) {

        // Tìm trong tất cả bảng với keyword
        List<FrameResponse> frames = frameService
                .searchFrame(keyword, brand, material, size,
                        null, null, null, "ACTIVE", minPrice, maxPrice)
                .stream().map(FrameResponse::fromEntity).toList();

        List<LensResponse> lenses = lensService
                .searchLens(keyword, brand, null, null,
                        size, targetSph, "ACTIVE", minPrice, maxPrice)
                .stream().map(LensResponse::fromEntity).toList();

        List<ContactLensResponse> contactLenses = contactLensService
                .searchContactLens(keyword, null, brand, null,
                        targetSph, null, "ACTIVE", minPrice, maxPrice)
                .stream().map(ContactLensResponse::fromEntity).toList();

        List<ReadyMadeGlassesResponse> readyMade = readyMadeGlassesService
                .search(keyword, "ACTIVE", minPrice, maxPrice)
                .stream().map(ReadyMadeGlassesResponse::fromEntity).toList();

        return new SearchResponse(frames, lenses, contactLenses, readyMade);
    }
}