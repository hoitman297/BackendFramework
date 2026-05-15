package com.backpro.main.model.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import com.backpro.main.model.vo.User;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByCenter_CenterIdAndIsCompany(Long centerId, String isCompany);
    List<User> findByIsCompany(String isCompany);
}
