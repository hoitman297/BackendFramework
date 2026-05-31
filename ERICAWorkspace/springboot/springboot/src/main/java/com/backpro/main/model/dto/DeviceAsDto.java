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
    private String modelName;
    private Long branchId;
    private String branchName;
    private Long userId;
    private String userName;
    private Long rentalId;
    private Integer statusAs;
    private Integer typeAs;
    private LocalDateTime receiptDate;
    private String receiptDetails;
    private String checkerName;
    private LocalDateTime collectionDate;
    private String managerName;
    private String repairDetails;
    private LocalDateTime completionDate;
    private LocalDateTime redispatchDate;
    private LocalDateTime createdAt;
    private LocalDateTime dispatchDate;
}
