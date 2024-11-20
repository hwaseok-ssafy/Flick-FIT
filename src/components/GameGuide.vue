<template>
    <div class="container">
      <!-- 로고 -->
      <div class="logo">
        <img src="@/assets/fit_logo.png" alt="Flick FIT Logo" />
      </div>
  
      <!-- 설명 섹션 -->
      <div class="guide-container">
        <div class="overlay">
          <h2>게임 방법</h2>
          <ul class="guide-list">
            <li>1. 테마를 선택하여 배경을 설정하세요.</li>
            <li>2. 모드를 선택하여 난이도를 설정하세요.</li>
            <li>3. 화면에 나타나는 공이나 장애물을 피하세요.</li>
            <li>4. 몸을 움직여 캐릭터를 조작하고, 모든 스테이지를 클리어하세요!</li>
            <li>5. 일시정지 버튼을 눌러 게임을 중단하거나 재개할 수 있습니다.</li>
          </ul>
          <button class="back-button" @click="goBack">메인 화면으로</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "GameGuide",
    methods: {
      goBack() {
        this.$router.push({ name: "Home" }); // 메인 화면(Home.vue)으로 이동
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
  
  .guide-container {
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
  
  .guide-list {
    list-style: none;
    margin: 20px 0;
    padding: 0;
    font-size: 18px;
    color: #333;
    text-align: left;
  }
  
  .guide-list li {
    margin-bottom: 10px;
  }
  
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
  
  .back-button:hover {
    transform: scale(1.1);
    background-color: #218838;
  }
  </style>
  