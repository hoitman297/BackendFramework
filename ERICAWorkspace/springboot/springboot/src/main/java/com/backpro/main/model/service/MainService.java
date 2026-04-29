package com.backpro.main.model.service;

import com.backpro.main.model.dto.MainDto;
import com.backpro.main.model.vo.Main;
import com.backpro.main.repository.MainRepository;

public class MainService {

    private final MainRepository mRepository;

    public Main createUser(MainDto dto) {

        Main main = Main.builder()
                .userName(dto.getUser_name())
                .email(dto.getEmail())
                .userPassword(dto.getUser_password()) // 실제로는 암호화 필요
                .phone(dto.getPhone())
                .centerId(dto.getCenter_id())
                .isCompany(dto.getIs_company())
                .build();

        return mRepository.save(main);
    }
}
}
