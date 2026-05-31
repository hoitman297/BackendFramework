package com.backpro.main.model.vo;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {
    private Long deptId;
    private String deptName;
    @Builder.Default
    private Integer sortOrder = 1;
    @Builder.Default
    private String isUsed = "Y";
    private LocalDateTime applyDate;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
