package com.backpro.main;

import org.springframework.web.bind.annotation.*;

import com.backpro.main.model.dto.CenterDto;
import com.backpro.main.model.service.CenterService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/centers")
@RequiredArgsConstructor
public class CenterController {
    private final CenterService centerService;

    @GetMapping("/{id}")
    public CenterDto getCenter(@PathVariable Long id) {
        return centerService.getCenter(id);
    }

    @PatchMapping("/{id}")
    public CenterDto updateCenter(@PathVariable Long id, @RequestBody CenterDto req) {
        return centerService.updateCenter(id, req);
    }
}
