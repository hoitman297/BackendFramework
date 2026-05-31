package com.backpro.main.model.vo;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Lob;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "branch")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Branch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long branchId;

    @Column(nullable = false, length = 100)
    private String branchName;

    @Column(nullable = false, length = 1)
    private String statusCenter;

    @Lob
    private String address;

    @Column(length = 255)
    private String detailAddress;

    @Column(length = 50)
    private String managerName;

    @Column(length = 15)
    private String mainPhone;

    @Column(name = "is_deleted", nullable = false, length = 1)
    private String isDeleted = "N";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "branch")
    private List<Manager> managers = new ArrayList<>();

    @Builder
    public Branch(String branchName, String statusCenter, String address, String detailAddress, 
                  String managerName, String mainPhone) {
        this.branchName = branchName;
        this.statusCenter = statusCenter != null ? statusCenter : "N";
        this.address = address;
        this.detailAddress = detailAddress;
        this.managerName = managerName;
        this.mainPhone = mainPhone;
        this.isDeleted = "N";
        this.createdAt = LocalDateTime.now();
    }
}
