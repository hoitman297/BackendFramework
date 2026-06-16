package com.backpro.main.model.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backpro.main.model.vo.User;

public interface UserRepository extends JpaRepository<User, Long> {

    List<User> findByIsDeletedOrderByUserIdDesc(String isDeleted);

    List<User> findByIsDeletedAndIsCompanyOrderByUserIdDesc(String isDeleted, String isCompany);

    List<User> findByIsDeletedAndDepartmentOrderByUserIdDesc(String isDeleted, String department);

    List<User> findByIsDeletedAndTeamOrderByUserIdDesc(String isDeleted, String team);

    List<User> findByIsDeletedAndIsCompanyAndDepartmentOrderByUserIdDesc(String isDeleted, String isCompany, String department);

    List<User> findByIsDeletedAndIsCompanyAndTeamOrderByUserIdDesc(String isDeleted, String isCompany, String team);

    Optional<User> findByEmailAndIsDeleted(String email, String isDeleted);

    boolean existsByEmailAndIsDeleted(String email, String isDeleted);
}
