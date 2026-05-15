package com.backpro.main.model.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import com.backpro.main.model.vo.DeviceLog;
import java.util.List;

public interface DeviceLogRepository extends JpaRepository<DeviceLog, Long> {
    List<DeviceLog> findByUser_UserId(Long userId);
}
