package com.example.flickfit.model.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.flickfit.model.dao.UserDao;
import com.example.flickfit.model.dto.User;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserDao userDao;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // 회원가입
    @Override
    @Transactional
    public int insert(User user) {
        try {
            user.setUserId(UUID.randomUUID().toString()); // 고유 사용자 ID 생성
            user.setUserPw(encoder.encode(user.getUserPw())); // 비밀번호 암호화
            user.setCreatedAt(LocalDateTime.now()); // 계정 생성 시간 설정
            user.setLastLogin(null); // 초기값: 로그인 기록 없음
            return userDao.insert(user); // 데이터베이스에 사용자 추가
        } catch (Exception e) {
            throw new RuntimeException("Failed to register user: " + e.getMessage(), e);
        }
    }

    // ID로 사용자 검색
    @Override
    public User searchById(String id) {
        try {
            return userDao.searchById(id); // ID로 사용자 조회
        } catch (Exception e) {
            throw new RuntimeException("Failed to search user by ID: " + e.getMessage(), e);
        }
    }

    // 모든 사용자 조회
    @Override
    public List<User> selectAll() {
        try {
            return userDao.selectAll(); // 모든 사용자 목록 조회
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve all users: " + e.getMessage(), e);
        }
    }

    // 로그인
    @Override
    public User login(User user) {
        try {
            User foundUser = userDao.searchById(user.getUsername()); // 사용자 조회
            if (foundUser != null && encoder.matches(user.getUserPw(), foundUser.getUserPw())) {
                // 비밀번호 일치 시 로그인 성공
                foundUser.setLastLogin(LocalDateTime.now()); // 마지막 로그인 시간 업데이트
                userDao.updateLastLogin(foundUser.getUserId(), foundUser.getLastLogin()); // DB에 업데이트
                return foundUser; // 로그인 성공 시 사용자 정보 반환
            }
            return null; // 로그인 실패 시 null 반환
        } catch (Exception e) {
            throw new RuntimeException("Login failed: " + e.getMessage(), e);
        }
    }
}
