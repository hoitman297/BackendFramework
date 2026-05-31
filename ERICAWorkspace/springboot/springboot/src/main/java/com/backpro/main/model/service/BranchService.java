package com.backpro.main.model.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backpro.main.model.dao.BranchRepository;
import com.backpro.main.model.dao.ManagerRepository;
import com.backpro.main.model.dto.BranchDto;
import com.backpro.main.model.vo.Branch;
import com.backpro.main.model.vo.Manager;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;
    private final ManagerRepository managerRepository;

    /**
     * [FIX] 기존 getAllBranches()는 List<Branch> 엔티티 직접 반환 → List<BranchDto>로 변경.
     * [FIX] 기존에 Repository에 이미 구현된 search() JPQL 쿼리를 활용하지 않음 → 통합.
     */
    public List<BranchDto> getBranches(String status, String keyword) {
        return branchRepository.search(status, keyword)
            .stream()
            .map(BranchDto::from)
            .collect(Collectors.toList());
    }

    public BranchDto getBranch(Long id) {
        Branch branch = branchRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("지점을 찾을 수 없습니다: " + id));
        if ("Y".equals(branch.getIsDeleted())) {
            throw new IllegalArgumentException("삭제된 지점입니다: " + id);
        }
        return BranchDto.from(branch);
    }

    @Transactional
    public BranchDto createBranch(BranchDto req) {
        Branch branch = Branch.builder()
            .branchName(req.getBranchName())
            .branchShortName(req.getBranchShortName())
            .statusCenter(req.getStatusCenter() == null ? "운영" : req.getStatusCenter())
            .address(req.getAddress())
            .phone(req.getPhone())
            .fax(req.getFax())
            .sortOrder(req.getSortOrder() == null ? 1 : req.getSortOrder())
            .build();
        return BranchDto.from(branchRepository.save(branch));
    }

    @Transactional
    public BranchDto updateBranch(Long id, BranchDto req) {
        Branch branch = branchRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("지점을 찾을 수 없습니다: " + id));

        if ("Y".equals(branch.getIsDeleted())) {
            throw new IllegalStateException("삭제된 지점은 수정할 수 없습니다: " + id);
        }

        // PATCH: 전송된 값만 업데이트
        if (req.getBranchName() != null)      branch.setBranchName(req.getBranchName());
        if (req.getBranchShortName() != null)  branch.setBranchShortName(req.getBranchShortName());
        if (req.getStatusCenter() != null)     branch.setStatusCenter(req.getStatusCenter());
        if (req.getAddress() != null)          branch.setAddress(req.getAddress());
        if (req.getPhone() != null)            branch.setPhone(req.getPhone());
        if (req.getFax() != null)              branch.setFax(req.getFax());
        if (req.getSortOrder() != null)        branch.setSortOrder(req.getSortOrder());

        return BranchDto.from(branch);
    }

    /**
     * 소프트 삭제 - Branch.softDelete() 메서드 활용 (isDeleted = 'Y', deletedAt 기록)
     */
    @Transactional
    public void deleteBranch(Long id) {
        Branch branch = branchRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("지점을 찾을 수 없습니다: " + id));
        branch.softDelete();
    }

    public List<Manager> getManagersByBranch(Long branchId) {
        return managerRepository.findByBranch_BranchIdAndDeletedAtIsNull(branchId);
    }
}
