package com.backpro.main.model.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backpro.main.model.dao.BranchRepository;
import com.backpro.main.model.dao.ManagerRepository;
import com.backpro.main.model.vo.Branch;
import com.backpro.main.model.vo.Manager;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;
    private final ManagerRepository managerRepository;

    public List<Branch> getAllBranches(String status) {
        if (status == null || status.isEmpty()) {
            return branchRepository.findByIsDeleted("N");
        }
        return branchRepository.findByStatusCenterAndIsDeleted(status, "N");
    }

    public List<Manager> getManagersByBranch(Long branchId) {
        return managerRepository.findByBranch_BranchIdAndDeletedAtIsNull(branchId);
    }
}
