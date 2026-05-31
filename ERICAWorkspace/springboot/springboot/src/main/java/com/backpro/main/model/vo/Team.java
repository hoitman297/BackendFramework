package com.backpro.main.model.vo;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "team")
@Getter
@Setter                                             // [FIX] 추가 - updateTeam()의 setTeamName(), setSortOrder() 등 컴파일 오류
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "team_id")
    private Long teamId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dept_id", nullable = false)
    private Department department;

    @Column(name = "team_name", nullable = false, length = 100)
    private String teamName;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 1;

    @Column(name = "is_used", nullable = false, length = 1)
    @Builder.Default
    private String isUsed = "Y";

    @Column(name = "apply_date")
    private LocalDateTime applyDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
