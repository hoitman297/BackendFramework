package com.backpro.main;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backpro.main.model.dto.BranchDto;
import com.backpro.main.model.service.BranchService;
import com.backpro.main.model.vo.Manager;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;

    @GetMapping
    public List<BranchDto> getBranches(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String keyword
    ) {
        return branchService.getBranches(status, keyword);
    }

    @GetMapping("/{id}")
    public BranchDto getBranch(@PathVariable Long id) {
        return branchService.getBranch(id);
    }

    @PostMapping
    public BranchDto createBranch(@RequestBody BranchDto req) {
        return branchService.createBranch(req);
    }

    @PatchMapping("/{id}")
    public BranchDto updateBranch(@PathVariable Long id, @RequestBody BranchDto req) {
        return branchService.updateBranch(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBranch(@PathVariable Long id) {
        branchService.deleteBranch(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/managers")
    public List<Manager> getManagersByBranch(@PathVariable Long id) {
        return branchService.getManagersByBranch(id);
    }
}
