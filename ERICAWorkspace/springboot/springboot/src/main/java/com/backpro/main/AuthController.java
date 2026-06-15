package com.backpro.main;

import com.backpro.main.model.dao.UserMapper;
import com.backpro.main.model.dto.ApiResponse;
import com.backpro.main.model.vo.User;
import com.backpro.main.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String rawPassword = body.get("password");

        User user = userMapper.findByEmail(username)
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(rawPassword, user.getUserPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getUserId());
        return ApiResponse.ok(Map.of(
                "token", token,
                "user_id", user.getUserId(),
                "user_name", user.getUserName(),
                "email", user.getEmail()
        ));
    }
}
