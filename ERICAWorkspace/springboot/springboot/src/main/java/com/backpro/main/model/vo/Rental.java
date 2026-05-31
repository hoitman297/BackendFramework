package com.backpro.main.model.vo;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rental {
    private Long rentalId;
    private Long deviceId;
    private Long branchId;
    @Builder.Default
    private Integer statusRent = 0;
    @Builder.Default
    private LocalDateTime reqDate = LocalDateTime.now();
    private LocalDateTime expStartDate;
    private LocalDateTime expReturnDate;
    private LocalDateTime receiptDate;
    private LocalDateTime returnDate;
    @Builder.Default
    private String isWorn = "N";
    private Long userId;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime deletedAt;
}
