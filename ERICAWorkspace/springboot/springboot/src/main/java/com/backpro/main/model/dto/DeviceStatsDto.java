package com.backpro.main.model.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceStatsDto {
    private Long total;
    private Long inStock;     // 입고 (0)
    private Long renting;     // 임대중 (1)
    private Long waiting;     // 임대대기 (2)
    private Long asReceived;  // AS접수 (3)
    private Long asCompleted; // AS완료 (4)
    private Long discarded;   // 폐기 (9)
}
