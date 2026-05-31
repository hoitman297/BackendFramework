package com.backpro.main.model.vo;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Emergency {
    private Long emergencyId;
    private String typeEmergency;
    private Long userId;
    private Long deviceId;
    private LocalDateTime eventTime;
    private String locationAddress;
    @Builder.Default
    private Integer statusEmergency = 0;
    @Builder.Default
    private Integer severityEmergency = 0;
    private LocalDateTime resolvedTime;
    private LocalDateTime updatedAt;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime deletedAt;
}
