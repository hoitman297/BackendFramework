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

/**
 * [FIX] 기존 파일은 빈 껍데기(@RestController만 선언) → 전체 CRUD 엔드포인트 구현
 */
@RestController
@RequestMapping("/api/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;

    /**
     * GET /api/branches?status=운영&keyword=서울
     * - status, keyword 모두 optional
     * - BranchRepository.search() JPQL 쿼리 활용 (isDeleted='N' 포함)
     */
    @GetMapping
    public List<BranchDto> getBranches(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String keyword
    ) {
        return branchService.getBranches(status, keyword);
    }

    /**
     * GET /api/branches/{id}
     */
    @GetMapping("/{id}")
    public BranchDto getBranch(@PathVariable Long id) {
        return branchService.getBranch(id);
    }

    /**
     * POST /api/branches
     */
    @PostMapping
    public BranchDto createBranch(@RequestBody BranchDto req) {
        return branchService.createBranch(req);
    }

    /**
     * PATCH /api/branches/{id}
     * - 전송된 필드만 업데이트 (null 값은 기존 유지)
     */
    @PatchMapping("/{id}")
    public BranchDto updateBranch(@PathVariable Long id, @RequestBody BranchDto req) {
        return branchService.updateBranch(id, req);
    }

    /**
     * DELETE /api/branches/{id}
     * - 실제 삭제가 아닌 소프트 삭제 (isDeleted='Y', deletedAt 기록)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBranch(@PathVariable Long id) {
        branchService.deleteBranch(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/branches/{id}/managers
     * - 해당 지점 담당자 목록 (삭제되지 않은 것만)
     */
    @GetMapping("/{id}/managers")
    public List<Manager> getManagersByBranch(@PathVariable Long id) {
        return branchService.getManagersByBranch(id);
    }
}
