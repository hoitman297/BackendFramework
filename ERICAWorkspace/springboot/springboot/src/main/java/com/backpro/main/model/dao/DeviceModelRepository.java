package com.backpro.main.model.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import com.backpro.main.model.vo.DeviceModel;

public interface DeviceModelRepository extends JpaRepository<DeviceModel, Long> {
}
