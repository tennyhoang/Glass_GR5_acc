package org.group5.springmvcweb.glassesweb.Service;


import org.group5.springmvcweb.glassesweb.DTO.CreateReadyMadeGlassesRequest;
import org.group5.springmvcweb.glassesweb.DTO.UpdateReadyMadeGlassesRequest;
import org.group5.springmvcweb.glassesweb.Entity.ReadyMadeGlasses;

import java.math.BigDecimal;
import java.util.List;

public interface ReadyMadeGlassesService {

    List<ReadyMadeGlasses> search(String name, String status,
                                  BigDecimal minPrice, BigDecimal maxPrice);
    ReadyMadeGlasses create(CreateReadyMadeGlassesRequest request);
    ReadyMadeGlasses getById(Integer id);
    List<ReadyMadeGlasses> getAll();
    ReadyMadeGlasses update(Integer id, UpdateReadyMadeGlassesRequest request);
    void delete(Integer id);

}
