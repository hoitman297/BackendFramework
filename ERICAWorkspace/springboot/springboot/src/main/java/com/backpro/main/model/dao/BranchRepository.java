package com.backpro.main.model.dao;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.backpro.main.model.vo.Branch;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findByIsDeleted(String isDeleted);
    List<Branch> findByStatusCenterAndIsDeleted(String statusCenter, String isDeleted);
}
