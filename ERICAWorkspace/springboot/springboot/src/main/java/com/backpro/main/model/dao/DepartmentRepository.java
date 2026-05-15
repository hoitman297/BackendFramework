package com.backpro.main.model.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import com.backpro.main.model.vo.Department;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
}
