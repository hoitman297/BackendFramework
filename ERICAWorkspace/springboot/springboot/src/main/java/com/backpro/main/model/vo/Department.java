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

    @Column(nullable = false, length = 100)
    private String dept_name;

    @Column(nullable = false)
    @Builder.Default
    private Integer sort_order = 1;

    @Column(nullable = false, length = 1)
    @Builder.Default
    private String is_used = "Y";

    private LocalDateTime apply_date;

    @JsonIgnore
    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Team> teams = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime created_at = LocalDateTime.now();
}
