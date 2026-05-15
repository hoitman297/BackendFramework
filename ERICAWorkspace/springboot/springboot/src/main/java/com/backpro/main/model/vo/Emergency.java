package com.backpro.main.model.vo;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "emergency")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Emergency {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long emergency_id;

    @Column(length = 50)
    private String type_emergency;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    private LocalDateTime event_time;

    @Lob
    private String location_address;

    @Column(nullable = false)
    @Builder.Default
    private Integer status_emergency = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer severity_emergency = 0;

    private LocalDateTime resolved_time;
    private LocalDateTime updated_at;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime created_at = LocalDateTime.now();

    private LocalDateTime deleted_at;
}
