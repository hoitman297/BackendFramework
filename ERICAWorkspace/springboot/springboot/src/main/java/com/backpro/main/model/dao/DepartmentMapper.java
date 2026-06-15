package com.backpro.main.model.dao;

import com.backpro.main.model.vo.Department;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface DepartmentMapper {
    List<Department> findAll();
    int insert(Department department);
    int update(Department department);
    int softDelete(@Param("deptId") Long deptId);
}
