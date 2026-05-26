package com.backpro.main.model.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backpro.main.model.dao.DepartmentRepository;
import com.backpro.main.model.dao.TeamRepository;
import com.backpro.main.model.dto.DepartmentDto;
import com.backpro.main.model.dto.TeamDto;
import com.backpro.main.model.vo.Department;
import com.backpro.main.model.vo.Team;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrganizationService {
    private final DepartmentRepository departmentRepository;
    private final TeamRepository teamRepository;

    public List<DepartmentDto> getDepartments(String keyword) {
        List<Department> departments = (keyword == null || keyword.isBlank())
            ? departmentRepository.findAllByOrderBySortOrderAsc()
            : departmentRepository.findByDeptNameContainingIgnoreCaseOrderBySortOrderAsc(keyword);
        return departments.stream().map(DepartmentDto::from).collect(Collectors.toList());
    }

    @Transactional
    public DepartmentDto createDepartment(DepartmentDto req) {
        Department department = Department.builder()
            .dept_name(req.getDept_name())
            .sort_order(req.getSort_order() == null ? 1 : req.getSort_order())
            .is_used(req.getIs_used() == null ? "Y" : req.getIs_used())
            .apply_date(req.getApply_date())
            .build();
        return DepartmentDto.from(departmentRepository.save(department));
    }

    @Transactional
    public DepartmentDto updateDepartment(Long id, DepartmentDto req) {
        Department d = departmentRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("부서를 찾을 수 없습니다: " + id));
        d.setDept_name(req.getDept_name());
        d.setSort_order(req.getSort_order() == null ? 1 : req.getSort_order());
        d.setIs_used(req.getIs_used() == null ? "Y" : req.getIs_used());
        d.setApply_date(req.getApply_date());
        return DepartmentDto.from(d);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }

    public List<TeamDto> getTeams(Long deptId, String keyword) {
        List<Team> teams;
        if (deptId != null && keyword != null && !keyword.isBlank()) {
            teams = teamRepository.findByDepartmentDeptIdAndTeamNameContainingIgnoreCaseOrderBySortOrderAsc(deptId, keyword);
        } else if (deptId != null) {
            teams = teamRepository.findByDepartmentDeptIdOrderBySortOrderAsc(deptId);
        } else if (keyword != null && !keyword.isBlank()) {
            teams = teamRepository.findByTeamNameContainingIgnoreCaseOrderBySortOrderAsc(keyword);
        } else {
            teams = teamRepository.findAll();
        }
        return teams.stream().map(TeamDto::from).collect(Collectors.toList());
    }

    @Transactional
    public TeamDto createTeam(TeamDto req) {
        Department department = departmentRepository.findById(req.getDept_id())
            .orElseThrow(() -> new IllegalArgumentException("부서를 찾을 수 없습니다: " + req.getDept_id()));
        Team team = Team.builder()
            .department(department)
            .team_name(req.getTeam_name())
            .sort_order(req.getSort_order() == null ? 1 : req.getSort_order())
            .is_used(req.getIs_used() == null ? "Y" : req.getIs_used())
            .apply_date(req.getApply_date())
            .build();
        return TeamDto.from(teamRepository.save(team));
    }

    @Transactional
    public TeamDto updateTeam(Long id, TeamDto req) {
        Team t = teamRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("팀을 찾을 수 없습니다: " + id));
        if (req.getDept_id() != null) {
            Department department = departmentRepository.findById(req.getDept_id())
                .orElseThrow(() -> new IllegalArgumentException("부서를 찾을 수 없습니다: " + req.getDept_id()));
            t.setDepartment(department);
        }
        t.setTeam_name(req.getTeam_name());
        t.setSort_order(req.getSort_order() == null ? 1 : req.getSort_order());
        t.setIs_used(req.getIs_used() == null ? "Y" : req.getIs_used());
        t.setApply_date(req.getApply_date());
        return TeamDto.from(t);
    }

    @Transactional
    public void deleteTeam(Long id) {
        teamRepository.deleteById(id);
    }
}
