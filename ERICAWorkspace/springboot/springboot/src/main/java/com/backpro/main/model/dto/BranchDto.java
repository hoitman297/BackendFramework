package com.backpro.main.model.dto;

import com.backpro.main.model.vo.Branch;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BranchDto {
    private Long branchId;
    private String branchName;
    private String branchShortName;
    private String statusCenter;
    private String address;
    private String phone;
    private String fax;
    private Integer sortOrder;

    public static BranchDto from(Branch branch) {
        return BranchDto.builder()
                .branchId(branch.getBranchId())
                .branchName(branch.getBranchName())
                .branchShortName(branch.getBranchShortName())
                .statusCenter(branch.getStatusCenter())
                .address(branch.getAddress())
                .phone(branch.getPhone())
                .fax(branch.getFax())
                .sortOrder(branch.getSortOrder())
                .build();
    }
}