package com.backpro.main.model.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeviceRequestDto {
    private Long modelId;
    private Long branchId;
    private Integer deviceStatus;
    private Integer batteryLevel;
    private LocalDateTime receiveDate;
    private LocalDateTime dispatchDate;
    private String deviceSpecs;
    private Long userId;
    private Long centerId;
}
