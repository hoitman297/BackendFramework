package com.backpro.main.model.vo;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    @JsonProperty("user_id")
    private Long userId;

    @Column(name = "user_name", nullable = false, length = 50)
    @JsonProperty("user_name")
    private String userName;

    @Column(name = "is_deleted", nullable = false, length = 1)
    @Builder.Default
    @JsonProperty("is_deleted")
    private String isDeleted = "N";

    @Column(name = "user_password", nullable = false, length = 255)
    @JsonProperty("user_password")
    private String userPassword;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "phone", nullable = false, length = 15)
    private String phone;

    @Column(name = "center_id")
    @JsonProperty("center_id")
    private Long centerId;

    @Column(name = "is_company", nullable = false, length = 1)
    @Builder.Default
    @JsonProperty("is_company")
    private String isCompany = "N";

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "team", length = 100)
    private String team;

    @Column(name = "`rank`")
    private Integer rank;

    @Column(name = "work_status", length = 50)
    @Builder.Default
    @JsonProperty("work_status")
    private String workStatus = "재직";

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    @JsonProperty("created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "deleted_at")
    @JsonProperty("deleted_at")
    private LocalDateTime deletedAt;
}
