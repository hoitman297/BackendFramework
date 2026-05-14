package com.backpro.main.model.vo;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Main {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_name", nullable = false)
    private String userName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "user_password", nullable = false)
    private String userPassword;

    private String phone;

    @Column(name = "center_id")
    private Long centerId;

    @Column(name = "is_company")
    private Boolean isCompany;
}