package com.backpro.main.model.dao;

import com.backpro.main.model.vo.Team;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface TeamMapper {
    List<Team> findByDeptId(@Param("deptId") Long deptId);
    int insert(Team team);
    int update(Team team);
    int softDelete(@Param("teamId") Long teamId);
}
