package com.backpro.main.model.dto;

import java.time.LocalDateTime;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalResponseDto {
    private Long rentalId;
    private Long deviceId;
    private Long branchId;
    private String branchName;
    private Integer statusRent;
    private LocalDateTime reqDate;
    private LocalDateTime expStartDate;
    private LocalDateTime expReturnDate;
    private LocalDateTime receiptDate;
    private LocalDateTime returnDate;
    private String isWorn;
    private Long userId;
    private String userName;
    private Long modelId;
    private String modelName;
    private Integer batteryLevel;
    private LocalDateTime createdAt;
}
