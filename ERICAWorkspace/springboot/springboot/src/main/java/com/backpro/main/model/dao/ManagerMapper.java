package com.backpro.main.model.dao;

import com.backpro.main.model.vo.Manager;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface ManagerMapper {
    List<Manager> findByBranchIdAndDeletedAtIsNull(@Param("branchId") Long branchId);
    Optional<Manager> findById(@Param("managerId") Long managerId);
    int insert(Manager manager);
    int update(Manager manager);
}
