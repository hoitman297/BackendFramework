package com.backpro.main.model.dao;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.backpro.main.model.vo.Manager;

@Repository
public interface ManagerRepository extends JpaRepository<Manager, Long> {
    List<Manager> findByBranch_BranchIdAndDeletedAtIsNull(Long branchId);
}
