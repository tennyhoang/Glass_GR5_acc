package org.group5.springmvcweb.glassesweb.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OperationDashboardResponse {
    private Long myInProgress;
    private Long myCompleted;
    private Long totalManufacturing;
}