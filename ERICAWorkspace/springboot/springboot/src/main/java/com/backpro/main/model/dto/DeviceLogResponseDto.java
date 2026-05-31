package com.backpro.main.model.dto;

import java.time.LocalDateTime;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceLogResponseDto {
    private Long logId;
    private Long deviceId;
    private Long userId;
    private String userName;
    private String branchName;
    private Long modelId;
    private String modelName;
    private LocalDateTime lastUsedDate;
    private Integer usageTimePerDay;
    private Integer totalUsageTime;
    private Integer respRatePerDay;
    private Integer stepsPerDay;
    private Integer totalSteps;
    private String lastLocation;
    private Integer batteryLevel;
    private LocalDateTime createdAt;
    // Latest emergency for this device (nullable)
    private Long emergencyId;
    private Integer typeEmergency;
    private LocalDateTime emergencyTime;
    private Integer statusEmergency;
}
