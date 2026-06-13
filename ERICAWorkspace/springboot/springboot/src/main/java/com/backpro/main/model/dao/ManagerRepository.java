package com.backpro.main.model.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backpro.main.model.vo.Manager;

public interface ManagerRepository extends JpaRepository<Manager, Long> {

    List<Manager> findByBranch_BranchIdAndDeletedAtIsNull(Long branchId);
}
