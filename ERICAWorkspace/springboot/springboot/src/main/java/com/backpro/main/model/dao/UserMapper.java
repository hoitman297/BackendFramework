package com.backpro.main.model.dao;

import com.backpro.main.model.vo.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface UserMapper {
    List<User> findAll();
    List<User> findByFilters(@Param("isCompany") String isCompany,
                             @Param("department") String department,
                             @Param("team") String team,

                             @Param("centerId") Long centerId);
    Optional<User> findById(@Param("userId") Long userId);
    Optional<User> findByEmail(@Param("email") String email);
    int insert(User user);
    int update(User user);
    int softDelete(@Param("userId") Long userId);
}
