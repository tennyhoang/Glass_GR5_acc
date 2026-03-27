package org.group5.springmvcweb.glassesweb.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "LensOption")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LensOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lens_option_id")
    private Integer lensOptionId;

    @NotBlank(message = "Index value is required")
    @Column(name = "index_value", nullable = false, length = 50)
    private String indexValue;

    @NotBlank(message = "Coating is required")
    @Column(name = "coating", nullable = false, length = 100)
    private String coating;

    @Positive(message = "Price must be > 0")
    @Column(name = "extra_price", precision = 18, scale = 2, nullable = false)
    private BigDecimal extraPrice;

    // ✅ Thêm option_name cho BE3 dùng
    @Column(name = "option_name", length = 255)
    private String optionName;
}