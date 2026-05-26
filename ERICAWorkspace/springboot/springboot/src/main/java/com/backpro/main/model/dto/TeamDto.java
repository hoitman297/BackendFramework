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
            .team_id(t.getTeam_id())
            .dept_id(t.getDepartment().getDeptId())
            .dept_name(t.getDepartment().getDept_name())
            .team_name(t.getTeam_name())
            .sort_order(t.getSort_order())
            .is_used(t.getIs_used())
            .apply_date(t.getApply_date())
            .build();
    }
}
