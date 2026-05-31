package com.backpro.main.model.vo;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "center")
@Getter
@Setter                                             // [FIX] 추가 - updateCenter()의 setCenterName() 등 모든 setter 컴파일 오류
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Center {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long centerId;

    @Column(nullable = false, length = 100)
    private String centerName;

    @Column(length = 50)
    private String centerShortName;

    @Column(length = 100)
    private String engName;

    @Column(length = 12, unique = true)
    private String bizRegNo;

    @Column(length = 50)
    private String directorName;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 15)
    private String mainPhone;

    @Column(length = 15)
    private String mainFax;

    @Column(length = 50)
    private String bizType;

    @Column(length = 50)
    private String bizCategory;

    @Column(length = 50)
    private String taxMgrName;

    private String logoImgUrl;
    private String sealImgUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
