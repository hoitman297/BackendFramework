package com.backpro.main.model.vo;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "branch")
@Getter
@Setter                                                     // [FIX 1] 추가 - setter 없어 updateBranch() 전체 컴파일 오류
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder                                                    // [FIX 2] 생성자 한정 → 클래스 레벨로 변경 (일부 필드 builder 호출 불가 해소)
public class Branch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "branch_id")
    private Long branchId;

    @Column(name = "branch_name", nullable = false, length = 100)
    private String branchName;

    @Column(name = "branch_short_name", length = 50)
    private String branchShortName;                         // [FIX 3] 추가 - BranchDto/BranchService가 참조하나 필드 없음

    @Column(name = "status_center", nullable = false, length = 20)  // [FIX 4] length 1→20 (한글값 "운영" 저장 불가)
    @Builder.Default
    private String statusCenter = "운영";                   // [FIX 5] 기본값 "N" → "운영" (의미 없는 값)

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "detail_address", length = 255)
    private String detailAddress;

    @Column(name = "manager_name", length = 50)
    private String managerName;

    @Column(length = 15)
    private String phone;                                   // [FIX 6] mainPhone → phone (BranchDto·BranchService 모두 phone 사용)

    @Column(length = 15)
    private String fax;                                     // [FIX 7] 추가 - BranchDto/BranchService가 참조하나 필드 없음

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 1;                         // [FIX 8] 추가 - BranchDto/BranchService가 참조하나 필드 없음

    @Column(name = "is_deleted", nullable = false, length = 1)
    @Builder.Default
    private String isDeleted = "N";

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "branch", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Manager> managers = new ArrayList<>();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void softDelete() {                              // [FIX 9] 추가 - BranchService.deleteBranch()에서 호출하나 메서드 없음
        this.isDeleted = "Y";
        this.deletedAt = LocalDateTime.now();
    }
}
