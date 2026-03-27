package org.group5.springmvcweb.glassesweb.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class SearchResponse {
    private List<FrameResponse> frames;
    private List<LensResponse> lenses;
    private List<ContactLensResponse> contactLenses;
    private List<ReadyMadeGlassesResponse> readyMadeGlasses;
}