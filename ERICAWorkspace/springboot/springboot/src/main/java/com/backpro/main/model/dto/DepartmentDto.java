package com.backpro.main.model.dto;

import java.time.LocalDateTime;

import com.backpro.main.model.vo.Department;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DepartmentDto {
    private Long dept_id;
    private String dept_name;
    private Integer sort_order;
    private String is_used;
    private LocalDateTime apply_date;

    public static DepartmentDto from(Department d) {
        return DepartmentDto.builder()
            .dept_id(d.getDeptId())
            .dept_name(d.getDept_name())
            .sort_order(d.getSort_order())
            .is_used(d.getIs_used())
            .apply_date(d.getApply_date())
            .build();
    }
}
