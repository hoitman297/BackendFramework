package com.backpro.main.model.dao;

import com.backpro.main.model.vo.Emergency;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.Optional;

@Mapper
public interface EmergencyMapper {
    int insert(Emergency emergency);
    int update(Emergency emergency);
    Optional<Emergency> findById(@Param("emergencyId") Long emergencyId);
}
