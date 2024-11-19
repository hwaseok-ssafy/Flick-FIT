<template>
  <div id="signup" class="signup-container">
    <!-- 배경 이미지 -->
    <div class="background"></div>

    <!-- 로고 -->
    <div class="logo">
      <img src="@/assets/fit_logo.png" alt="Flick FIT Logo" />
    </div>

    <!-- 입력 박스 -->
    <div class="signup-box-container">
      <!-- 왼쪽 버튼 -->
      <button
        v-if="store.step > 1"
        class="signup-button left-button"
        @click="store.handleLeftButtonClick"
      >
        <img src="@/assets/left.png" alt="Left Arrow" class="button-icon" />
      </button>

      <!-- 입력 필드 -->
      <div class="signup-box">
        <input
          v-if="store.step === 1"
          type="text"
          v-model="store.signupData.username"
          placeholder="아이디를 입력하세요"
          class="signup-input"
        />
        <input
          v-if="store.step === 2"
          type="password"
          v-model="store.signupData.password"
          placeholder="비밀번호를 입력하세요"
          class="signup-input"
        />
        <input
          v-if="store.step === 3"
          type="text"
          v-model="store.signupData.name"
          placeholder="사용자 이름을 입력하세요"
          class="signup-input"
        />
        <input
          v-if="store.step === 4"
          type="number"
          v-model="store.signupData.height"
          placeholder="키 (cm)"
          class="signup-input"
        />
        <input
          v-if="store.step === 5"
          type="number"
          v-model="store.signupData.weight"
          placeholder="몸무게 (kg)"
          class="signup-input"
        />
        <input
          v-if="store.step === 6"
          type="number"
          v-model="store.signupData.age"
          placeholder="나이"
          class="signup-input"
        />
        <select
          v-if="store.step === 7"
          v-model="store.signupData.gender"
          class="signup-input"
        >
          <option value="" disabled>성별을 선택하세요</option>
          <option value="male">남성</option>
          <option value="female">여성</option>
        </select>
        <input
          v-if="store.step === 8"
          type="number"
          v-model="store.signupData.calorieGoal"
          placeholder="소비 칼로리 목표 (kcal)"
          class="signup-input"
        />
      </div>

      <!-- 오른쪽 버튼 -->
      <button
        class="signup-button right-button"
        @click="store.handleRightButtonClick"
      >
        <img src="@/assets/right.png" alt="Right Arrow" class="button-icon" />
      </button>
    </div>
  </div>
</template>

<script>
import { useSignupStore } from "@/stores/signupStore"; // 올바른 store 파일 경로

export default {
  name: "Signup",
  setup() {
    const store = useSignupStore(); // Pinia store 사용
    return { store }; // store 반환
  },
};
</script>


<style scoped>
  /* 전체 컨테이너 */
  .signup-container {
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
    position: relative;
    top: -130%;
    left: 45%;
    transform: translateX(-50%);
    width: 38vw;
    height: auto;
    max-width: 600px;
    margin-bottom: 20px;
  }
  
  /* 입력 박스 컨테이너 */
  .signup-box-container {
    position: absolute;
    bottom: 62%;
    left: 48.5%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50%;
    max-width: 600px;
  }
  
  /* 입력 박스 */
  .signup-box {
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
  .signup-input {
    flex: 1;
    height: 100%;
    border: none;
    font-size: 1rem;
    outline: none;
    background: none;
    text-align: center;
  }
  
  /* 버튼 스타일 */
  .signup-button {
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
    margin-right: 10px;
  }
  
  .right-button {
    margin-left: 10px;
  }
  </style>
  