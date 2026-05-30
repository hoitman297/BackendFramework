package com.backpro.main.model.vo;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Center {
    private Long centerId;
    private String centerName;
    private String centerShortName;
    private String engName;
    private String bizRegNo;
    private String directorName;
    private String address;
    private String mainPhone;
    private String mainFax;
    private String bizType;
    private String bizCategory;
    private String taxMgrName;
    private String logoImgUrl;
    private String sealImgUrl;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime deletedAt;
}
