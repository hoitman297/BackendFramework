package com.backpro.main.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MainDto {

    private String user_name;
    private String email;
    private String user_password;
    private String phone;
    private Long center_id;
    private Boolean is_company;
}