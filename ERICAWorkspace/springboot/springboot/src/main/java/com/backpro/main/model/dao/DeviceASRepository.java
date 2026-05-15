package com.backpro.main.model.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.backpro.main.model.vo.DeviceAS;
import java.util.List;

public interface DeviceASRepository extends JpaRepository<DeviceAS, Long> {

    @Query("SELECT a FROM DeviceAS a JOIN FETCH a.device JOIN FETCH a.branch WHERE a.device.deviceId = :deviceId")
    List<DeviceAS> findByDeviceIdWithDetails(@Param("deviceId") Long deviceId);

    @Query("SELECT a FROM DeviceAS a JOIN FETCH a.device JOIN FETCH a.branch")
    List<DeviceAS> findAllWithDetails();
}
