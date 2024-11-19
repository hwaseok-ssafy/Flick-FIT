package com.example.flickfit.model.dto;

import java.time.LocalDateTime;

public class User {
    private String userId;            // 고유 사용자 ID (UUID 형식)
    private String userPw;            // 사용자 비밀번호
    private String username;          // 사용자 이름
    private Float weight;             // 체중
    private Float height;             // 키
    private Integer age;              // 나이
    private String gender;            // 성별 ("male" or "female")
    private Float goalCalories;       // 일일 칼로리 소모 목표
    private Integer goalFrequency;    // 주간 목표 운동 빈도
    private LocalDateTime createdAt;  // 계정 생성일
    private LocalDateTime lastLogin;  // 마지막 로그인 날짜

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserPw() {
        return userPw;
    }

    public void setUserPw(String userPw) {
        this.userPw = userPw;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Float getWeight() {
        return weight;
    }

    public void setWeight(Float weight) {
        this.weight = weight;
    }

    public Float getHeight() {
        return height;
    }

    public void setHeight(Float height) {
        this.height = height;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Float getGoalCalories() {
        return goalCalories;
    }

    public void setGoalCalories(Float goalCalories) {
        this.goalCalories = goalCalories;
    }

    public Integer getGoalFrequency() {
        return goalFrequency;
    }

    public void setGoalFrequency(Integer goalFrequency) {
        this.goalFrequency = goalFrequency;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }
}
