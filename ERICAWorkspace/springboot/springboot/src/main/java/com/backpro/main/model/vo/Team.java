package com.backpro.main.model.vo;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {
    private Long teamId;
    private Long deptId;
    private String teamName;
    @Builder.Default
    private Integer sortOrder = 1;
    @Builder.Default
    private String isUsed = "Y";
    private LocalDateTime applyDate;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
