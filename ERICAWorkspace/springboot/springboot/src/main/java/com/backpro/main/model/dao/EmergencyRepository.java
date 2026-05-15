package com.backpro.main.model.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import com.backpro.main.model.vo.Emergency;

public interface EmergencyRepository extends JpaRepository<Emergency, Long> {
}
