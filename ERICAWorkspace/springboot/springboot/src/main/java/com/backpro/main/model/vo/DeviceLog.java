package com.backpro.main.model.vo;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceLog {
    private Long logId;
    private Long deviceId;
    private LocalDateTime lastUsedDate;
    private Integer usageTimePerDay;
    private Integer totalUsageTime;
    private Integer respRatePerDay;
    private Integer stepsPerDay;
    private Integer totalSteps;
    private String lastLocation;
    private Long userId;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime deletedAt;
}
