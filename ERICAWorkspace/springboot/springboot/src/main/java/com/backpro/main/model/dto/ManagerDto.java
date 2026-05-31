package com.backpro.main.model.dto;

import com.backpro.main.model.vo.Manager;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManagerDto {
    private Long managerId;
    private Long branchId;
    private String branchName;
    private String managerName;
    private String department;
    private String team;
    private String rankName;
    private String email;
    private String phone;
    private String workStatus;
    private String isCompany;

    public static ManagerDto from(Manager manager) {
        return ManagerDto.builder()
                .managerId(manager.getManagerId())
                .branchId(manager.getBranch().getBranchId())
                .branchName(manager.getBranch().getBranchName())
                .managerName(manager.getManagerName())
                .department(manager.getDepartment())
                .team(manager.getTeam())
                .rankName(manager.getRankName())
                .email(manager.getEmail())
                .phone(manager.getPhone())
                .workStatus(manager.getWorkStatus())
                .isCompany(manager.getIsCompany())
                .build();
    }
}
