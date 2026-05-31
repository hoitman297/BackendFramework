package com.backpro.main.model.dao;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backpro.main.model.vo.Department;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    // [FIX] OrganizationService.getDepartments()에서 호출하나 메서드 삭제됨 → 복구
    List<Department> findAllByOrderBySortOrderAsc();

    List<Department> findByDeptNameContainingIgnoreCaseOrderBySortOrderAsc(String keyword);

}
