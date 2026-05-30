package com.backpro.main.model.vo;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    private Long userId;
    private String userName;
    @Builder.Default
    private String isDeleted = "N";
    private String userPassword;
    private String email;
    private String phone;
    private Long centerId;
    @Builder.Default
    private String isCompany = "N";
    private String department;
    private String team;
    private String rank;
    private String workStatus;
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime deletedAt;
}
