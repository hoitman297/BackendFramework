package com.backpro.main.model.vo;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceAS {
    private Long asId;
    private Long deviceId;
    private Long branchId;
    @Builder.Default
    private Integer statusAs = 0;
    @Builder.Default
    private Integer typeAs = 0;
    private LocalDateTime receiptDate;
    private String receiptDetails;
    private String checkerName;
    private LocalDateTime collectionDate;
    private String managerName;
    private String repairDetails;
    private LocalDateTime completionDate;
    private LocalDateTime redispatchDate;
    private Long userId;
    private Long rentalId;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime deletedAt;
}
