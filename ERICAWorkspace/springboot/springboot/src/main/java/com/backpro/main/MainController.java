package com.backpro.main;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backpro.main.model.service.MainService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequestMapping("/main")
@RestController
@RequiredArgsConstructor
public class MainController {
	
	private final MainService mservice;

		
	
}
