package com.example.flickfit.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.flickfit.model.dto.User;
import com.example.flickfit.model.service.UserService;
import com.example.flickfit.util.JwtUtil;

@RestController
@RequestMapping("/userapi")
@CrossOrigin(origins = "*")
public class UserRestController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * 모든 사용자 조회
     */
    @GetMapping("/user")
    public ResponseEntity<?> selectAll() {
        try {
            List<User> users = userService.selectAll();
            if (users != null && !users.isEmpty()) {
                return new ResponseEntity<>(users, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
        } catch (Exception e) {
            return exceptionHandling(e);
        }
    }

    /**
     * ID로 사용자 조회
     */
    @GetMapping("/user/{id}")
    public ResponseEntity<?> select(@PathVariable String id) {
        try {
            User user = userService.searchById(id);
            if (user != null) {
                return new ResponseEntity<>(user, HttpStatus.OK);
            } else {
                return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return exceptionHandling(e);
        }
    }

    /**
     * 회원가입
     */
    @PostMapping("/user")
    public ResponseEntity<?> insert(@RequestBody User user) {
        try {
            int result = userService.insert(user);
            if (result > 0) {
                return new ResponseEntity<>("User registered successfully!", HttpStatus.CREATED);
            } else {
                return new ResponseEntity<>("Failed to register user", HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            return exceptionHandling(e);
        }
    }

    /**
     * 로그인
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        HttpStatus status;
        Map<String, Object> result = new HashMap<>();

        try {
            User loginUser = userService.login(user);
            if (loginUser != null) {
                String token = jwtUtil.createToken(loginUser.getUserId());
                result.put("access-token", token);
                result.put("user", loginUser);
                status = HttpStatus.ACCEPTED;
            } else {
                result.put("message", "Invalid credentials");
                status = HttpStatus.UNAUTHORIZED;
            }
        } catch (Exception e) {
            return exceptionHandling(e);
        }

        return new ResponseEntity<>(result, status);
    }

    /**
     * 예외 처리
     */
    private ResponseEntity<String> exceptionHandling(Exception e) {
        e.printStackTrace();
        return new ResponseEntity<>("Sorry: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
