package com.backpro.main.model.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backpro.main.model.vo.Center;

public interface CenterRepository extends JpaRepository<Center, Long> {
    List<Center> findByDeletedAtIsNull();
    List<Center> findByCenterNameContainingIgnoreCaseAndDeletedAtIsNull(String keyword);
}
