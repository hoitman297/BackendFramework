package com.backpro.main.model.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backpro.main.model.vo.Manager;

/**
 * [NEW] BranchService에서 import하나 파일이 없어 컴파일 불가 → 신규 생성
 */
public interface ManagerRepository extends JpaRepository<Manager, Long> {

    // BranchService에서 호출하는 기존 메서드 (branch.branchId 탐색 + deletedAt IS NULL 조건)
    List<Manager> findByBranch_BranchIdAndDeletedAtIsNull(Long branchId);
}
