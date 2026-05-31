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
            .dept_name(d.getDeptName())       // [FIX] getDept_name() → getDeptName()
            .sort_order(d.getSortOrder())     // [FIX] getSort_order() → getSortOrder()
            .is_used(d.getIsUsed())           // [FIX] getIs_used() → getIsUsed()
            .apply_date(d.getApplyDate())     // [FIX] getApply_date() → getApplyDate()
            .build();
    }
}
