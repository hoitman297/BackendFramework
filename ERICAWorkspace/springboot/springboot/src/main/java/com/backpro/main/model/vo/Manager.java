package com.backpro.main.model.vo;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "manager")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Manager {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "manager_id")
    private Long managerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(name = "manager_name", nullable = false, length = 50)
    private String managerName;

    @Column(length = 50)
    private String department;          // [ADD] ManagerDto.getDepartment() 참조 → 필드 없어 컴파일 오류

    @Column(length = 50)
    private String team;                // [ADD] ManagerDto.getTeam() 참조 → 필드 없어 컴파일 오류

    @Column(name = "rank_name", length = 30)
    private String rankName;            // [FIX] role → rankName (ManagerDto.getRankName() 기준으로 통일)

    @Column(length = 100)
    private String email;

    @Column(length = 15)
    private String phone;

    @Column(name = "work_status", length = 20)
    @Builder.Default
    private String workStatus = "재직"; // [ADD] ManagerDto.getWorkStatus() 참조 → 필드 없어 컴파일 오류

    @Column(name = "is_company", length = 1)
    @Builder.Default
    private String isCompany = "Y";     // [ADD] ManagerDto.getIsCompany() 참조 → 필드 없어 컴파일 오류

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }
}
