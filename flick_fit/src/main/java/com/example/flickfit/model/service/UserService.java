package com.example.flickfit.model.service;

import java.util.List;
import com.example.flickfit.model.dto.User;

public interface UserService {
    int insert(User user); // 회원가입
    User searchById(String id); // ID로 사용자 검색
    List<User> selectAll(); // 모든 사용자 조회
    User login(User user); // 로그인
}
