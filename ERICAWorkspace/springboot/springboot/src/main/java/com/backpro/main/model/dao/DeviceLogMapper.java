package com.backpro.main.model.dao;

import com.backpro.main.model.dto.DeviceLogResponseDto;
import com.backpro.main.model.vo.DeviceLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface DeviceLogMapper {
    List<DeviceLogResponseDto> findAllWithDetails();
    List<DeviceLogResponseDto> findByBranchId(@Param("branchId") Long branchId);
    List<DeviceLogResponseDto> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") String startDate,
            @Param("endDate") String endDate);
    int insert(DeviceLog log);
}
