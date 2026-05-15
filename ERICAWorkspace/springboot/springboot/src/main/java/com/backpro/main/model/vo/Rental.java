package com.backpro.main.model.vo;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rental")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Rental {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rentalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(nullable = false)
    @Builder.Default
    private Integer statusRent = 0;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime reqDate = LocalDateTime.now();

    private LocalDateTime expStartDate;

    @Column(nullable = false)
    private LocalDateTime expReturnDate;

    private LocalDateTime receiptDate;
    private LocalDateTime returnDate;

    @Column(nullable = false, length = 1)
    @Builder.Default
    private String isWorn = "N";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime created_at = LocalDateTime.now();

    private LocalDateTime deleted_at;
}
