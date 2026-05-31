package com.backpro.main.model.vo;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "department")
@Getter
@Setter                                             // [FIX] 추가 - updateDepartment()의 setDeptName(), setSortOrder() 등 컴파일 오류
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dept_id")
    private Long deptId;

    @Column(name = "dept_name", nullable = false, length = 100)
    private String deptName;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 1;

    @Column(name = "is_used", nullable = false, length = 1)
    @Builder.Default
    private String isUsed = "Y";

    @Column(name = "apply_date")
    private LocalDateTime applyDate;

    @JsonIgnore
    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, orphanRemoval = false)
    @Builder.Default
    private List<Team> teams = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
