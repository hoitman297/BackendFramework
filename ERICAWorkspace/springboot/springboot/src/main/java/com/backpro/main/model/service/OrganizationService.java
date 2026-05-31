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

    // ─────────────────────────────────────────────
    // Department
    // ─────────────────────────────────────────────

    public List<DepartmentDto> getDepartments(String keyword) {
        List<Department> departments = (keyword == null || keyword.isBlank())
            ? departmentRepository.findAllByOrderBySortOrderAsc()
            : departmentRepository.findByDeptNameContainingIgnoreCaseOrderBySortOrderAsc(keyword);
        return departments.stream().map(DepartmentDto::from).collect(Collectors.toList());
    }

    @Transactional
    public DepartmentDto createDepartment(DepartmentDto req) {
        Department department = Department.builder()
            .deptName(req.getDept_name())                                           // [FIX] builder key
            .sortOrder(req.getSort_order() == null ? 1 : req.getSort_order())      // [FIX]
            .isUsed(req.getIs_used() == null ? "Y" : req.getIs_used())             // [FIX]
            .applyDate(req.getApply_date())                                         // [FIX]
            .build();
        return DepartmentDto.from(departmentRepository.save(department));
    }

    @Transactional
    public DepartmentDto updateDepartment(Long id, DepartmentDto req) {
        Department d = departmentRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("부서를 찾을 수 없습니다: " + id));

        // [FIX] PATCH 의미에 맞게 null 값은 기존 값 유지 (전부 덮어쓰지 않음)
        if (req.getDept_name() != null)  d.setDeptName(req.getDept_name());
        if (req.getSort_order() != null) d.setSortOrder(req.getSort_order());
        if (req.getIs_used() != null)    d.setIsUsed(req.getIs_used());
        if (req.getApply_date() != null) d.setApplyDate(req.getApply_date());

        return DepartmentDto.from(d);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department d = departmentRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("부서를 찾을 수 없습니다: " + id));

        // [FIX] 하위 팀이 남아있으면 삭제 차단 (기존에는 아무 확인 없이 삭제)
        if (!d.getTeams().isEmpty()) {
            throw new IllegalStateException("소속 팀이 존재하는 부서는 삭제할 수 없습니다. 팀을 먼저 삭제해 주세요.");
        }
        departmentRepository.deleteById(id);
    }

    // ─────────────────────────────────────────────
    // Team
    // ─────────────────────────────────────────────

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
            .teamName(req.getTeam_name())                                           // [FIX] builder key
            .sortOrder(req.getSort_order() == null ? 1 : req.getSort_order())      // [FIX]
            .isUsed(req.getIs_used() == null ? "Y" : req.getIs_used())             // [FIX]
            .applyDate(req.getApply_date())                                         // [FIX]
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
        // [FIX] PATCH: null 값은 기존 값 유지
        if (req.getTeam_name() != null)  t.setTeamName(req.getTeam_name());
        if (req.getSort_order() != null) t.setSortOrder(req.getSort_order());
        if (req.getIs_used() != null)    t.setIsUsed(req.getIs_used());
        if (req.getApply_date() != null) t.setApplyDate(req.getApply_date());

        return TeamDto.from(t);
    }

    @Transactional
    public void deleteTeam(Long id) {
        // [FIX] 기존: deleteById()만 호출, 존재하지 않아도 예외 없음 → 명시적으로 존재 확인
        teamRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("팀을 찾을 수 없습니다: " + id));
        teamRepository.deleteById(id);
    }
}
