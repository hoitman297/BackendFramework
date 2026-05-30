package com.backpro.main.model.dao;

import com.backpro.main.model.vo.Center;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.Optional;

@Mapper
public interface CenterMapper {
    Optional<Center> findById(@Param("centerId") Long centerId);
    int insert(Center center);
    int update(Center center);
}
