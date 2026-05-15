package com.backpro.main.model.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import com.backpro.main.model.vo.Center;

public interface CenterRepository extends JpaRepository<Center, Long> {
}
