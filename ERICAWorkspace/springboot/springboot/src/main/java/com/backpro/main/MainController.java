package com.backpro.main;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backpro.main.model.dto.MainDto;
import com.backpro.main.model.service.MainService;
import com.backpro.main.model.vo.Main;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequestMapping("/main")
@RestController
@RequiredArgsConstructor
public class MainController {

    private final MainService mService;

    @PostMapping
    public Main createUser(@RequestBody MainDto dto) {
        return mService.createUser(dto);
    }
}