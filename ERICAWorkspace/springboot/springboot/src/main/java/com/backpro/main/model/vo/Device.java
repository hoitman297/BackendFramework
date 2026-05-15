package com.backpro.main.model.vo;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "device")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Device {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deviceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", nullable = false)
    private DeviceModel model;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(nullable = false)
    @Builder.Default
    private Integer deviceStatus = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer batteryLevel = 100;

    private LocalDateTime receiveDate;
    private LocalDateTime dispatchDate;
    private LocalDateTime lastRentalDate;
    private LocalDateTime lastAsDate;

    @Lob
    private String deviceSpecs;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "center_id")
    private Center center;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime deletedAt;

    public void update(Integer deviceStatus, Integer batteryLevel,
                       LocalDateTime receiveDate, LocalDateTime dispatchDate,
                       String deviceSpecs, Branch branch, DeviceModel model) {
        if (deviceStatus != null) this.deviceStatus = deviceStatus;
        if (batteryLevel != null) this.batteryLevel = batteryLevel;
        if (receiveDate != null) this.receiveDate = receiveDate;
        if (dispatchDate != null) this.dispatchDate = dispatchDate;
        if (deviceSpecs != null) this.deviceSpecs = deviceSpecs;
        if (branch != null) this.branch = branch;
        if (model != null) this.model = model;
    }
}
