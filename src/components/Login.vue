<template>
  <div id="login" class="login-container">
    <!-- 배경 이미지 -->
    <div class="background"></div>

    <!-- 로고 -->
    <div class="logo">
      <img src="@/assets/fit_logo.png" alt="Flick FIT Logo" />
    </div>

    <!-- 로그인 박스 -->
    <div class="login-box-container">
      <!-- 왼쪽 버튼 -->
      <button
        v-if="step===2"
        class="login-button left-button"
        @click="handleLeftButtonClick"
      >
        <img src="@/assets/left.png" alt="Left Arrow" class="button-icon" />
      </button>

      <!-- 입력 필드 -->
      <div class="login-box">
        <input
          v-if="step === 1"
          type="text"
          v-model="username"
          placeholder="아이디를 입력하세요"
          class="login-input"
        />
        <input
          v-if="step === 2"
          type="password"
          v-model="password"
          placeholder="비밀번호를 입력하세요"
          class="login-input"
        />
      </div>

      <!-- 오른쪽 버튼 -->
      <button
        class="login-button right-button"
        @click="handleRightButtonClick"
      >
        <img src="@/assets/right.png" alt="Right Arrow" class="button-icon" />
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Login",
  data() {
    return {
      step: 1, // 현재 단계 (1: 아이디 입력, 2: 비밀번호 입력)
      username: "", // 아이디 저장
      password: "", // 비밀번호 저장
    };
  },
  methods: {
    handleLeftButtonClick() {
      if (this.step === 2) {
        // 비밀번호 단계에서 이전 단계(아이디 입력)로 돌아가기
        this.step = 1;
        this.password = ""; // 비밀번호 초기화
      } else if (this.step === 1) {
        // 아이디 입력 단계에서 초기화
        this.username = "";
      }
    },
    handleRightButtonClick() {
      if (this.step === 1 && this.username) {
        // 아이디 입력 완료 후 비밀번호 입력 단계로 이동
        this.step = 2;
      } else if (this.step === 2 && this.password) {
        // 비밀번호 입력 완료 후 로그인 처리
        this.submitLogin();
      }
    },
    async submitLogin() {
      try {
        const response = await axios.post("http://localhost:8080/userapi/login", {
          username: this.username,
          password: this.password,
        });

        if (response.status === 202) {
          console.log("로그인 성공!");
          console.log("토큰:", response.data["access-token"]); // JWT 토큰 출력
        } else {
          console.log("로그인 실패");
        }
      } catch (error) {
        console.error("로그인 오류:", error.message);
      }
    },
  },
};
</script>

<style scoped>
/* 전체 컨테이너 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  position: relative;
  background: url("@/assets/home_back.jpg") no-repeat center center;
  background-size: 100% 100%;
}

/* 배경 스타일 */
.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

/* 로고 스타일 */
.logo img {
  position: relative; /* 상대 위치 */
  top: -130%; /* 화면 상단으로부터의 거리 */
  left: 45%; /* 화면 중앙에 위치 */
  transform: translateX(-50%); /* 수평 중앙 정렬 */
  width: 38vw; /* 로고 크기 */
  height: auto; /* 비율 유지 */
  max-width: 600px;
  margin-bottom: 20px;
}

/* 로그인 박스 컨테이너 */
.login-box-container {
  position: absolute; /* 절대 위치로 변경 */
  bottom: 62%; /* 화면 하단으로부터의 거리 */
  left: 48.5%; /* 화면 가로 중앙 정렬 */
  transform: translateX(-50%); /* 수평 중앙 정렬 */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50%; /* 로그인 박스 전체 너비 */
  max-width: 600px;
}

/* 로그인 박스 */
.login-box {
  flex: 1;
  height: 50px;
  background-color: rgba(255, 255, 255, 1);
  border: 2.75px solid #000000;
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  box-sizing: border-box;
}

/* 입력 필드 */
.login-input {
  flex: 1;
  height: 100%;
  border: none;
  font-size: 1rem;
  outline: none;
  background: none;
  text-align: center;
}

/* 버튼 스타일 */
.login-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

/* 버튼 이미지 */
.button-icon {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.left-button {
  margin-right: 10px; /* 왼쪽 버튼과 입력 필드 간격 */
}

.right-button {
  margin-left: 10px; /* 오른쪽 버튼과 입력 필드 간격 */
}
</style>
