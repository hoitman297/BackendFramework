package com.backpro.main.model.dao;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backpro.main.model.vo.Team;

public interface TeamRepository extends JpaRepository<Team, Long> {

    // 기존 유지
    List<Team> findByDepartmentDeptId(Long deptId);

    // [FIX] OrganizationService.getTeams()에서 호출하나 메서드 삭제됨 → 복구
    List<Team> findByDepartmentDeptIdOrderBySortOrderAsc(Long deptId);

    List<Team> findByTeamNameContainingIgnoreCaseOrderBySortOrderAsc(String keyword);

    List<Team> findByDepartmentDeptIdAndTeamNameContainingIgnoreCaseOrderBySortOrderAsc(Long deptId, String keyword);
}
