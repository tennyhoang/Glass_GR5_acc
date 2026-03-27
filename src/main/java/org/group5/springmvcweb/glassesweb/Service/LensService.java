package org.group5.springmvcweb.glassesweb.Service;

import org.group5.springmvcweb.glassesweb.DTO.CreateLensRequest;
import org.group5.springmvcweb.glassesweb.DTO.UpdateLensRequest;
import org.group5.springmvcweb.glassesweb.Entity.Lens;

import java.math.BigDecimal;
import java.util.List;

public interface LensService {
    Lens createLens(CreateLensRequest request);
    Lens updateLens(Integer id, UpdateLensRequest request);
    void deleteLens(Integer id);
    Lens getLensById(Integer id);
    List<Lens> getAllLens();
    List<Lens> searchLens(String name,String brand, String lensType,
                          Boolean colorChange, String lensSize, BigDecimal targetSph,
                          String status, BigDecimal minPrice, BigDecimal maxPrice);


}
