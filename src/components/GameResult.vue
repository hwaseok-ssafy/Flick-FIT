<template>
    <div class="container">
      <!-- 로고 -->
      <div class="logo">
        <img src="@/assets/fit_logo.png" alt="Flick FIT Logo" />
      </div>
  
      <!-- 결과 섹션 -->
      <div class="result-container">
        <div class="overlay">
          <h2>게임 결과</h2>
  
          <!-- 개인 통계 -->
          <div class="user-stats">
            <p>닉네임: <span class="highlight">{{ username }}</span></p>
            <p>목표 칼로리: <span class="highlight">{{ goalCalories }} kcal</span></p>
          </div>
  
          <!-- 현재 게임 결과 -->
          <div class="session-stats">
            <h3>이번 세션</h3>
            <p>점수: <span class="highlight">{{ score }}</span></p>
            <p>소모 칼로리: <span class="highlight">{{ caloriesBurned }} kcal</span></p>
            <p>보너스 칼로리: <span class="highlight">{{ bonusCalories }} kcal</span></p>
          </div>
  
          <!-- 일일 통계 -->
          <div class="daily-stats">
            <h3>오늘의 기록</h3>
            <p>소모 칼로리: <span class="highlight">{{ dailyCaloriesBurned }} kcal</span></p>
            <p>운동 횟수: <span class="highlight">{{ dailySessionsCount }}</span> 회</p>
            <p>목표 달성 여부: 
              <span class="highlight">{{ dailyGoalAchieved ? '달성' : '미달성' }}</span>
            </p>
          </div>
  
          <!-- 버튼 -->
          <div class="result-buttons">
            <button class="back-button" @click="retryGame">게임 다시 하기</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "GameResult",
    data() {
      return {
        // 사용자 정보 (예시 데이터, 실제로는 API로부터 받아와야 함)
        username: "JohnDoe",
        goalCalories: 500,
  
        // 현재 세션 데이터
        score: 1230,
        caloriesBurned: 150.5,
        bonusCalories: 20.0,
  
        // 일일 통계 데이터
        dailyCaloriesBurned: 400,
        dailySessionsCount: 3,
        dailyGoalAchieved: true,
      };
    },
    methods: {
      retryGame() {
        this.$router.push({ name: "VideoPose" }); // 게임 화면으로 이동
      },
    },
  };
  </script>
  
  <style scoped>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html,
  body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  
  .container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    font-family: 'Arial', sans-serif;
    background: url('@/assets/result_back.jpg') no-repeat center center;
    background-size: cover;
  }
  
  .logo {
    position: absolute;
    top: 50px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
  }
  
  .logo img {
    width: 60%;
    height: auto;
  }
  
  .result-container {
    margin-top: 5%;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .overlay {
    text-align: center;
    background: rgb(255, 255, 255, 0.9);
    padding: 40px;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }
  
  h2 {
    font-size: 28px;
    color: #000;
    margin-bottom: 20px;
  }
  
  h3 {
    font-size: 24px;
    color: #333;
    margin-bottom: 15px;
    text-align: left;
  }
  
  p {
    margin-bottom: 10px;
    font-size: 18px;
    color: #333;
    text-align: left;
  }
  
  .highlight {
    font-weight: bold;
    color: #ff4500;
  }
  
  .result-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
  }
  
  .retry-button,
  .back-button {
    padding: 10px 30px;
    font-size: 18px;
    font-weight: bold;
    background-color: #28a745;
    border: none;
    border-radius: 10px;
    color: #fff;
    cursor: pointer;
    transition: transform 0.3s, background-color 0.3s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  .retry-button:hover,
  .back-button:hover {
    transform: scale(1.1);
    background-color: #218838;
  }
  </style>
  