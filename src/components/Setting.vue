<template>
    <div class="container">
      <!-- 로고 -->
      <div class="logo">
        <img src="@/assets/fit_logo.png" alt="Flick FIT Logo" />
      </div>
  
      <!-- 설정 화면 -->
      <div class="settings-container">
        <div class="overlay">
          <h2>환경 설정</h2>
  
  
          <!-- 회원 정보 수정 -->
          <div class="setting-item">
            <button @click="goToEditUserInfo">회원 정보 수정</button>
          </div>
  
          <!-- 돌아가기 버튼 -->
          <div class="back-button">
            <button @click="goBack">뒤로가기</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "Setting",
    data() {
      return {
        isMusicOn: true, // 배경음악 상태
      };
    },
    methods: {
      toggleMusic() {
        if (this.isMusicOn) {
          console.log("배경음악 켜짐");
          // 배경음악 재생 로직 추가
        } else {
          console.log("배경음악 꺼짐");
          // 배경음악 정지 로직 추가
        }
      },
      goToEditUserInfo() {
        this.$router.push({ name: "EditUserInfo" }); // 회원 정보 수정 페이지로 이동
      },
      goBack() {
        this.$router.push({ name: "Home" }); // 홈 화면으로 이동
      },
    },
  };
  </script>
  
  <style scoped>
  .container {
    position: relative;
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    font-family: "Arial", sans-serif;
    background: url("@/assets/home_back.jpg") no-repeat center center;
    background-size: cover;
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
  
  .settings-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .overlay {
    background: rgb(255, 255, 255, 0.9);
    padding: 40px;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    text-align: center;
    width: 80%;
    max-width: 400px;
  }
  
  h2 {
    font-size: 24px;
    margin-bottom: 20px;
    color: #333;
  }
  
  .setting-item {
  margin: 20px 0;
  display: flex; /* 수평 정렬 */
  align-items: center; /* 세로 가운데 정렬 */
  justify-content: center; /* 가로 가운데 정렬 */
  gap: 10px; /* 텍스트와 토글 사이 간격 */
}

.setting-item label {
  font-size: 16px;
  margin-right: 5px;
}
  
  button {
    padding: 10px 20px;
    font-size: 16px;
    color: white;
    background-color: #28a745;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #218838;
  }
  
  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 25px;
  }
  
  .toggle-switch input {
    display: none;
  }
  
  .slider {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    border-radius: 25px;
    cursor: pointer;
    transition: 0.4s;
  }
  
  .slider:before {
    position: absolute;
    content: "";
    height: 19px;
    width: 19px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    border-radius: 50%;
    transition: 0.4s;
  }
  
  input:checked + .slider {
    background-color: #28a745;
  }
  
  input:checked + .slider:before {
    transform: translateX(24px);
  }
  
  .back-button {
    margin-top: 20px;
  }
  
  .back-button button {
    background-color: #28a745;
  }
  
  .back-button button:hover {
    background-color: #218838;
  }
  </style>
  