package com.backpro.main.model.dao;

import com.backpro.main.model.vo.Branch;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface BranchMapper {
    List<Branch> findByIsDeleted(@Param("isDeleted") String isDeleted);
    List<Branch> findByStatusCenterAndIsDeleted(@Param("statusCenter") String statusCenter, @Param("isDeleted") String isDeleted);
    Optional<Branch> findById(@Param("branchId") Long branchId);
    int insert(Branch branch);
    int update(Branch branch);
    int deleteById(@Param("branchId") Long branchId);
}
