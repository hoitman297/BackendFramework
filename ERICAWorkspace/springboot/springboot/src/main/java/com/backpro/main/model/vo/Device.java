package com.backpro.main.model.vo;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Device {
    private Long deviceId;
    private Long modelId;
    private Long branchId;
    @Builder.Default
    private Integer deviceStatus = 0;
    @Builder.Default
    private Integer batteryLevel = 100;
    private LocalDateTime receiveDate;
    private LocalDateTime dispatchDate;
    private LocalDateTime lastRentalDate;
    private LocalDateTime lastAsDate;
    private String deviceSpecs;
    private Long userId;
    private Long centerId;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime deletedAt;
}
