package com.backpro.main.model.vo;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

/**
 * [NEW] BranchService, Branch 엔티티에서 참조하나 파일이 없어 컴파일 불가 → 신규 생성
 */
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

    @Column(length = 15)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(name = "role", length = 30)
    @Builder.Default
    private String role = "일반";   // 예: 관리자, 일반 등

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }
}
