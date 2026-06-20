package com.backpro.main.model.dao;

import com.backpro.main.model.vo.DeviceModel;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface DeviceModelMapper {
    List<DeviceModel> findAll();
    List<DeviceModel> findByBranchId(@Param("branchId") Long branchId);
    Optional<DeviceModel> findById(@Param("modelId") Long modelId);
    int insert(DeviceModel model);
    int update(DeviceModel model);
    int softDelete(@Param("modelId") Long modelId);
}
