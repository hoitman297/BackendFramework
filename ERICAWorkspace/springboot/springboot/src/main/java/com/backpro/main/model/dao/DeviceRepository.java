package com.backpro.main.model.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.backpro.main.model.vo.Device;
import java.util.List;
import java.util.Optional;

public interface DeviceRepository extends JpaRepository<Device, Long> {

    @Query("SELECT d FROM Device d JOIN FETCH d.model JOIN FETCH d.branch WHERE d.deletedAt IS NULL")
    List<Device> findAllWithDetails();

    @Query("SELECT d FROM Device d JOIN FETCH d.model JOIN FETCH d.branch WHERE d.branch.branchId = :branchId AND d.deletedAt IS NULL")
    List<Device> findByBranchIdWithDetails(@Param("branchId") Long branchId);

    @Query("SELECT d FROM Device d JOIN FETCH d.model JOIN FETCH d.branch WHERE d.deviceId = :id")
    Optional<Device> findByIdWithDetails(@Param("id") Long id);
}
