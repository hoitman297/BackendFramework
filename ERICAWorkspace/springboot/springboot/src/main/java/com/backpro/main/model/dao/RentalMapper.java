package com.backpro.main.model.dao;

import com.backpro.main.model.dto.RentalResponseDto;
import com.backpro.main.model.vo.Rental;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface RentalMapper {
    List<RentalResponseDto> findAllWithDetails();
    List<RentalResponseDto> findByUserIdWithDetails(@Param("userId") Long userId);
    java.util.Optional<RentalResponseDto> findById(@Param("rentalId") Long rentalId);
    int insert(Rental rental);
    int update(Rental rental);
    int deleteById(@Param("rentalId") Long rentalId);
    int cancelActiveByDeviceId(@Param("deviceId") Long deviceId);
}
