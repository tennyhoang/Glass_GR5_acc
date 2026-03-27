package org.group5.springmvcweb.glassesweb.Service;

import org.group5.springmvcweb.glassesweb.DTO.CreateContactLensRequest;
import org.group5.springmvcweb.glassesweb.DTO.UpdateContactLensRequest;
import org.group5.springmvcweb.glassesweb.Entity.ContactLens;

import java.math.BigDecimal;
import java.util.List;

public interface ContactLensService {
    ContactLens createContactLens(CreateContactLensRequest request);
    ContactLens getContactLens(Integer id);
    ContactLens updateContactLens(Integer id, UpdateContactLensRequest request);
    void deleteContactLens(Integer id);
    List<ContactLens> getAllContactLens();
    List<ContactLens> searchContactLens(String name,
                                        String contactType,
                                        String brand,
                                        String color,
                                        BigDecimal targetSph,
                                        BigDecimal targetCyl,
                                        String status,
                                        BigDecimal minPrice,
                                        BigDecimal maxPrice);
}
