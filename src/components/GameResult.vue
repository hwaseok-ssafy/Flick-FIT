<template>
  <div class="container">
    <!-- 로고 -->
    <div class="logo">
      <img src="@/assets/fit_logo.png" alt="Flick FIT Logo" />
    </div>

    <!-- 결과 섹션 -->
    <div class="result-container">
      <div class="overlay" v-if="gameResult.startTime">
        <h2>게임 결과</h2>

        <!-- 현재 게임 결과 -->
        <div class="session-stats">
          <p>소모 칼로리: <span class="highlight">{{ formattedCaloriesBurned }} kcal</span></p>
          <p>획득한 코인: <span class="highlight">{{ gameResult.coins || 0 }}</span></p>
          <p>게임 시간: <span class="highlight">{{ adjustedGameDuration }} 초</span></p>
        </div>

        <!-- 버튼 -->
        <div class="result-buttons">
          <button class="retry-button" @click="retryGame">게임 다시 하기</button>
        </div>
      </div>

      <div class="overlay" v-else>
        <h2>결과를 불러오는 중...</h2>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "GameResult",
  data() {
    return {
      gameResult: {
        startTime: null,
        endTime: null,
        caloriesBurned: 0,
        coins: 0,
      },
    };
  },
  computed: {
    gameDuration() {
      if (!this.gameResult.startTime || !this.gameResult.endTime) {
        return 0; // 기본값
      }
      const startTime = new Date(this.gameResult.startTime);
      const endTime = new Date(this.gameResult.endTime);
      return Math.floor((endTime - startTime) / 1000); // 밀리초를 초 단위로 변환
    },
    adjustedGameDuration() {
      // 게임 시간에서 3초를 뺀 값 (최소값은 0으로 제한)
      return Math.max(0, this.gameDuration - 3);
    },
    formattedCaloriesBurned() {
      // 소수점 두 번째 자리까지만 표시
      return this.gameResult.caloriesBurned.toFixed(2);
    },
  },
  mounted() {
    try {
      const parsedData = this.$route.query.gameResult
        ? JSON.parse(this.$route.query.gameResult)
        : null;

      if (parsedData) {
        console.log("Parsed gameResult:", parsedData);
        this.gameResult = parsedData; // 데이터를 수동으로 설정
      } else {
        console.warn("No gameResult data found in query.");
      }
    } catch (error) {
      console.error("Error parsing gameResult data:", error);
    }

    console.log("Received gameResult:", this.gameResult);
  },
  methods: {
    retryGame() {
      this.$router.push({ name: "VideoPose" });
    },
  },
};
</script>

  <style scoped>
  /* 기존 CSS 유지 */
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
    font-family: "Arial", sans-serif;
    background: url("@/assets/result_back.jpg") no-repeat center center;
    background-size: cover;
  }
  
  .logo {
    position: absolute;
    top: 50px;
    left: 58%;
    transform: translateX(-50%);
    z-index: 10;
  }
  
  .logo img {
    width: 60%;
    height: auto;
  }
  
  .result-container {
    margin-top: 0%;
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
  
  .retry-button {
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
  
  .retry-button:hover {
    transform: scale(1.1);
    background-color: #218838;
  }
  </style>
  