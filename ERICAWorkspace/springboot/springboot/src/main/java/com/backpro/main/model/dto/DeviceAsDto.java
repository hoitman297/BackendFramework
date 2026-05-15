package com.backpro.main.model.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceAsDto {
    private Long asId;
    private Long deviceId;
    private Long branchId;
    private String branchName;
    private Integer statusAs;
    private Integer typeAs;
    private LocalDateTime receiptDate;
    private String receiptDetails;
    private String checkerName;
    private String managerName;
    private String repairDetails;
    private LocalDateTime completionDate;
    private LocalDateTime createdAt;
}
