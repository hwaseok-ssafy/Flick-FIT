package com.example.flickfit.model.dao;

import java.time.LocalDateTime;
import java.util.List;
import com.example.flickfit.model.dto.User;

public interface UserDao {
    int insert(User user); // 사용자 추가
    User searchById(String id); // ID로 사용자 검색
    List<User> selectAll(); // 모든 사용자 조회
    void updateLastLogin(String userId, LocalDateTime lastLogin); // 마지막 로그인 시간 업데이트
    User login(User user); // 로그인 (선택적으로 활용 가능)
}
