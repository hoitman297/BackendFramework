package com.backpro.main.model.dao;

import com.backpro.main.model.dto.DeviceAsDto;
import com.backpro.main.model.vo.DeviceAS;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface DeviceASMapper {
    List<DeviceAsDto> findAllWithDetails();
    List<DeviceAsDto> findByDeviceIdWithDetails(@Param("deviceId") Long deviceId);
    List<DeviceAsDto> findWithFilters(
            @Param("startDate") String startDate,
            @Param("endDate") String endDate,
            @Param("branchId") Long branchId,
            @Param("statusAs") Integer statusAs,
            @Param("typeAs") Integer typeAs,
            @Param("deviceId") Long deviceId);
    Optional<DeviceAsDto> findById(@Param("asId") Long asId);
    int insert(DeviceAS deviceAS);
    int update(DeviceAS deviceAS);
}
