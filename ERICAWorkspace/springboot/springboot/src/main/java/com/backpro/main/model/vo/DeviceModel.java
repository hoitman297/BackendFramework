package com.backpro.main.model.vo;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "device_model")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class DeviceModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long modelId;

    @Column(nullable = false, length = 100)
    private String modelName;

    @Column(length = 50)
    private String version;

    @Lob
    private String manualUrl;

    @Column(nullable = false, length = 1)
    @Builder.Default
    private String isDeleted = "N";

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime deletedAt;
}
