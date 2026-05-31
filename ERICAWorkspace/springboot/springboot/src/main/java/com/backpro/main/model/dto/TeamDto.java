package com.backpro.main.model.dto;

import java.time.LocalDateTime;

import com.backpro.main.model.vo.Team;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TeamDto {

    private Long team_id;
    private Long dept_id;
    private String dept_name;
    private String team_name;
    private Integer sort_order;
    private String is_used;
    private LocalDateTime apply_date;

    public static TeamDto from(Team t) {
        return TeamDto.builder()
            .team_id(t.getTeamId())                        // [FIX] getTeam_id() → getTeamId()
            .dept_id(t.getDepartment().getDeptId())
            .dept_name(t.getDepartment().getDeptName())    // [FIX] getDept_name() → getDeptName()
            .team_name(t.getTeamName())                    // [FIX] getTeam_name() → getTeamName()
            .sort_order(t.getSortOrder())                  // [FIX] getSort_order() → getSortOrder()
            .is_used(t.getIsUsed())                        // [FIX] getIs_used() → getIsUsed()
            .apply_date(t.getApplyDate())                  // [FIX] getApply_date() → getApplyDate()
            .build();
    }
}
