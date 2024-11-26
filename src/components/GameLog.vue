<template>
    <div class="container">
      <!-- 로고 -->
      <div class="logo">
        <img src="@/assets/fit_logo.png" alt="Flick FIT Logo" />
      </div>
  
      <!-- 게임 로그 섹션 -->
      <div class="log-container">
        <div class="overlay">
          <h2>게임 로그</h2>
          <table class="log-table">
            <thead>
              <tr>
                <th>#</th>
                <th>시작 시간</th>
                <th>종료 시간</th>
                <th>소모 칼로리</th>
                <th>획득 코인</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(log, index) in displayedLogs" :key="log.id">
                <td>{{ index + 1 }}</td>
                <td>{{ log.startTime }}</td>
                <td>{{ log.endTime }}</td>
                <td>{{ log.caloriesBurned.toFixed(2) }} kcal</td>
                <td>{{ log.coins }}</td>
              </tr>
            </tbody>
          </table>
          <button class="load-more-button" v-if="hasMoreLogs" @click="loadMoreLogs">더보기</button>
          <button class="back-button" @click="goBack">메인 화면으로</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "GameLog",
    data() {
      return {
        logs: [
          // 샘플 데이터, 실제 데이터는 API에서 가져올 수 있습니다.
          { id: 1, startTime: "2024-11-25 23:57:04", endTime: "2024-11-25 23:57:28", caloriesBurned: 1.44, coins: 0 },
          { id: 2, startTime: "2024-11-25 23:57:04", endTime: "2024-11-25 23:57:22", caloriesBurned: 0.58, coins: 0 },
          { id: 3, startTime: "2024-11-25 23:46:51", endTime: "2024-11-25 23:47:02", caloriesBurned: 0, coins: 0 },
          { id: 4, startTime: "2024-11-25 23:39:59", endTime: "2024-11-25 23:40:48", caloriesBurned: 1.12, coins: 0 },
          { id: 5, startTime: "2024-11-25 23:39:12", endTime: "2024-11-25 23:39:34", caloriesBurned: 0.26, coins: 0 },
        ],
        displayedLogs: [],
        logsPerPage: 3, // 한 번에 표시할 로그 개수
      };
    },
    computed: {
      hasMoreLogs() {
        return this.displayedLogs.length < this.logs.length;
      },
    },
    methods: {
      loadMoreLogs() {
        const nextLogs = this.logs.slice(
          this.displayedLogs.length,
          this.displayedLogs.length + this.logsPerPage
        );
        this.displayedLogs.push(...nextLogs);
      },
      goBack() {
        this.$router.push({ name: "Home" });
      },
    },
    mounted() {
      // 초기 데이터 로드
      this.loadMoreLogs();
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
    background: url('@/assets/home_back.jpg') no-repeat center center;
    background-size: 100% 100%;
  }
  
  .logo {
    position: absolute;
    top: 50px;
    left: 56%;
    transform: translateX(-50%);
    z-index: 10;
  }
  
  .logo img {
    width: 70%;
    height: auto;
  }
  
  .log-container {
    margin-top: 1%;
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
  
  .log-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  
  .log-table th,
  .log-table td {
    padding: 10px;
    text-align: center;
    border: 1px solid #ddd;
  }
  
  .log-table th {
    background-color: #f4f4f4;
    font-weight: bold;
  }
  
  .load-more-button,
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
    margin: 10px;
  }
  
  .load-more-button:hover,
  .back-button:hover {
    transform: scale(1.1);
    background-color: #218838;
  }
  </style>