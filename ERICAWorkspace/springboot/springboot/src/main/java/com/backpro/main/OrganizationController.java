package com.backpro.main;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.backpro.main.model.dto.DepartmentDto;
import com.backpro.main.model.dto.TeamDto;
import com.backpro.main.model.service.OrganizationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrganizationController {
    private final OrganizationService organizationService;

    @GetMapping("/depts")
    public List<DepartmentDto> getDepartments(@RequestParam(required = false) String keyword) {
        return organizationService.getDepartments(keyword);
    }

    @PostMapping("/depts")
    public DepartmentDto createDepartment(@RequestBody DepartmentDto req) {
        return organizationService.createDepartment(req);
    }

    @PatchMapping("/depts/{id}")
    public DepartmentDto updateDepartment(@PathVariable Long id, @RequestBody DepartmentDto req) {
        return organizationService.updateDepartment(id, req);
    }

    @DeleteMapping("/depts/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        organizationService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/teams")
    public List<TeamDto> getTeams(
        @RequestParam(name = "dept_id", required = false) Long deptId,
        @RequestParam(required = false) String keyword
    ) {
        return organizationService.getTeams(deptId, keyword);
    }

    @PostMapping("/teams")
    public TeamDto createTeam(@RequestBody TeamDto req) {
        return organizationService.createTeam(req);
    }

    @PatchMapping("/teams/{id}")
    public TeamDto updateTeam(@PathVariable Long id, @RequestBody TeamDto req) {
        return organizationService.updateTeam(id, req);
    }

    @DeleteMapping("/teams/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long id) {
        organizationService.deleteTeam(id);
        return ResponseEntity.noContent().build();
    }
}
