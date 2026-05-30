package com.backpro.main.model.dao;

import com.backpro.main.model.vo.Department;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface DepartmentMapper {
    List<Department> findAll();
    int insert(Department department);
}
