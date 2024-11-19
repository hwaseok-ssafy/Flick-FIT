use flickfit;

-- 사용자 테이블
CREATE TABLE User (
    user_id VARCHAR(36) PRIMARY KEY,         -- 고유 사용자 ID (UUID 형식)
    username VARCHAR(50) NOT NULL,           -- 사용자 이름
    weight FLOAT NOT NULL,                   -- 체중 (칼로리 계산에 필요)
    height FLOAT,                            -- 키 (필요 시)
    age INT,                                 -- 나이
    gender ENUM('male', 'female'),  -- 성별
    goal_calories FLOAT,                     -- 일일 칼로리 소모 목표
    goal_frequency INT,                      -- 주간 목표 운동 빈도
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 계정 생성일
    last_login DATETIME                      -- 마지막 로그인 날짜
);

-- 각 게임 결과
CREATE TABLE GameSession (
    session_id VARCHAR(36) PRIMARY KEY,      -- 고유 게임 세션 ID
    user_id VARCHAR(36),                     -- 사용자 ID 참조
    start_time DATETIME,                     -- 게임 시작 시간
    end_time DATETIME,                       -- 게임 종료 시간
    calories_burned FLOAT DEFAULT 0,         -- 게임 세션 동안 소모된 칼로리
    score INT DEFAULT 0,                     -- 최종 점수
    bonus_calories FLOAT DEFAULT 0,          -- 보너스로 소모된 칼로리
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
);

-- 일일 통계
CREATE TABLE DailyStats (
    stat_id VARCHAR(36) PRIMARY KEY,         -- 고유 통계 ID
    user_id VARCHAR(36),                     -- 사용자 ID 참조
    date DATE,                               -- 해당 일자
    calories_burned FLOAT DEFAULT 0,         -- 일일 소모 칼로리
    sessions_count INT DEFAULT 0,            -- 일일 세션 수
    achieved_goal BOOLEAN DEFAULT FALSE,     -- 일일 목표 달성 여부
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
);

-- 주간 통계
CREATE TABLE WeeklyStats (
    stat_id VARCHAR(36) PRIMARY KEY,         -- 고유 통계 ID
    user_id VARCHAR(36),                     -- 사용자 ID 참조
    week_start DATE,                         -- 해당 주 시작일
    calories_burned FLOAT DEFAULT 0,         -- 주간 소모 칼로리
    sessions_count INT DEFAULT 0,            -- 주간 세션 수
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
);

-- 월간 통계
CREATE TABLE MonthlyStats (
    stat_id VARCHAR(36) PRIMARY KEY,         -- 고유 통계 ID
    user_id VARCHAR(36),                     -- 사용자 ID 참조
    month DATE,                              -- 해당 월 (연월 형식)
    calories_burned FLOAT DEFAULT 0,         -- 월간 소모 칼로리
    sessions_count INT DEFAULT 0,            -- 월간 세션 수
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
);
