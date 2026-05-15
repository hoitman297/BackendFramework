package com.backpro.main.model.vo;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "device_as")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class DeviceAS {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long as_id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(nullable = false)
    @Builder.Default
    private Integer status_as = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer type_as = 0;

    private LocalDateTime receipt_date;

    @Lob
    private String receipt_details;

    @Column(length = 50)
    private String checker_name;

    private LocalDateTime collection_date;

    @Column(length = 50)
    private String manager_name;

    @Lob
    private String repair_details;

    private LocalDateTime completion_date;
    private LocalDateTime redispatch_date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rental_id")
    private Rental rental;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime created_at = LocalDateTime.now();

    private LocalDateTime deleted_at;
}
