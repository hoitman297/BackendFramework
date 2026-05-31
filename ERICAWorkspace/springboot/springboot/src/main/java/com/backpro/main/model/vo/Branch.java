package com.backpro.main.model.vo;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Branch {
    private Long branchId;
    private String branchName;
    private String statusCenter;
    private String address;
    private String detailAddress;
    private String managerName;
    private String mainPhone;
    @Builder.Default
    private String isDeleted = "N";
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime deletedAt;
}
