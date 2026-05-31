package com.backpro.main.model.vo;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "team")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "team_id")
    private Long teamId;   // [FIX] team_id → teamId

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dept_id", nullable = false)
    private Department department;

    @Column(name = "team_name", nullable = false, length = 100)
    private String teamName;   // [FIX] team_name → teamName

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 1;   // [FIX] sort_order → sortOrder

    @Column(name = "is_used", nullable = false, length = 1)
    @Builder.Default
    private String isUsed = "Y";   // [FIX] is_used → isUsed

    @Column(name = "apply_date")
    private LocalDateTime applyDate;   // [FIX] apply_date → applyDate

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();   // [FIX] created_at → createdAt
}
