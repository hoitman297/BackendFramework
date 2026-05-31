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
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dept_id")
    private Long deptId;

    // [FIX] dept_name → deptName
    // Spring Data JPA 메서드명(findByDeptName...)이 Java 필드명 기준으로 파싱됨.
    // snake_case 필드명은 PropertyReferenceException을 유발함.
    // SpringPhysicalNamingStrategy가 deptName → dept_name 컬럼으로 자동 변환하므로 DB 스키마 변경 불필요.
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
