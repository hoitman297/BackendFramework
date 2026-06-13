package com.backpro.main.model.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backpro.main.model.vo.Team;

public interface TeamRepository extends JpaRepository<Team, Long> {

    List<Team> findByDepartmentDeptId(Long deptId);

    List<Team> findByDepartmentDeptIdOrderBySortOrderAsc(Long deptId);

    List<Team> findByTeamNameContainingIgnoreCaseOrderBySortOrderAsc(String keyword);

    List<Team> findByDepartmentDeptIdAndTeamNameContainingIgnoreCaseOrderBySortOrderAsc(Long deptId, String keyword);
}
