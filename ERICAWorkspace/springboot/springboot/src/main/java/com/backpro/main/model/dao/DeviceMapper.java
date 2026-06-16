package com.backpro.main.model.dao;

import com.backpro.main.model.dto.DeviceResponseDto;
import com.backpro.main.model.vo.Device;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.backpro.main.model.dto.DeviceStatsDto;
import java.util.List;
import java.util.Optional;

@Mapper
public interface DeviceMapper {
    List<DeviceResponseDto> findAllWithDetails();
    List<DeviceResponseDto> findByBranchIdWithDetails(@Param("branchId") Long branchId);
    Optional<DeviceResponseDto> findByIdWithDetails(@Param("deviceId") Long deviceId);
    DeviceStatsDto findStats(@Param("branchId") Long branchId, @Param("modelId") Long modelId);
    int insert(Device device);
    int update(Device device);
    int updateStatus(@Param("deviceId") Long deviceId, @Param("deviceStatus") Integer deviceStatus);
    int deleteById(@Param("deviceId") Long deviceId);
}
