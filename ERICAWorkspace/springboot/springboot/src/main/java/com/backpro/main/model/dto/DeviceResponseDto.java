package com.backpro.main.model.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceResponseDto {
    private Long deviceId;
    private Long modelId;
    private String modelName;
    private String modelVersion;
    private String manualUrl;
    private Long branchId;
    private String branchName;
    private Integer deviceStatus;
    private Integer batteryLevel;
    private LocalDateTime receiveDate;
    private LocalDateTime dispatchDate;
    private LocalDateTime lastRentalDate;
    private LocalDateTime lastAsDate;
    private String deviceSpecs;
    private String modelSpecs;
    private Long userId;
    private LocalDateTime createdAt;
}
