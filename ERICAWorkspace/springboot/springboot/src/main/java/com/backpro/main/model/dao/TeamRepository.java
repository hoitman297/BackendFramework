package com.backpro.main.model.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import com.backpro.main.model.vo.Team;
import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByDepartmentDeptIdOrderBySortOrderAsc(Long deptId);
    List<Team> findByTeamNameContainingIgnoreCaseOrderBySortOrderAsc(String keyword);
    List<Team> findByDepartmentDeptIdAndTeamNameContainingIgnoreCaseOrderBySortOrderAsc(Long deptId, String keyword);
	List<Team> findByDepartmentDeptId(Long deptId);
}
