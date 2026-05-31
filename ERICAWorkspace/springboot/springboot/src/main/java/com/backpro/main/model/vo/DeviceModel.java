package com.backpro.main.model.vo;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceModel {
    private Long modelId;
    private String modelName;
    private String version;
    private String manualUrl;
    private String deviceSpecs;
    @Builder.Default
    private String isDeleted = "N";
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime deletedAt;
}
