package org.group5.springmvcweb.glassesweb.Service;

import org.group5.springmvcweb.glassesweb.DTO.CreateLensOptionRequest;
import org.group5.springmvcweb.glassesweb.DTO.UpdateLensOptionRequest;
import org.group5.springmvcweb.glassesweb.Entity.LensOption;

import java.util.List;

public interface LensOptionService {

    LensOption create(CreateLensOptionRequest request);
    LensOption update(Integer id, UpdateLensOptionRequest request);
    void delete(Integer id);
    LensOption getById(Integer id);
    List<LensOption> getAll();
}
