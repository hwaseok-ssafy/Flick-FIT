<template>
    <div class="container">
  
      <div class="form-container">
        <h2>회원 정보 수정</h2>
  
        <!-- 성별 선택 -->
        <div class="form-item">
          <label for="gender">성별</label>
          <select id="gender" v-model="gender">
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>
        </div>
  
        <!-- 키 입력 -->
        <div class="form-item">
          <label for="height">키 (cm)</label>
          <input type="number" id="height" v-model="height" placeholder="키 입력" />
        </div>
  
        <!-- 몸무게 입력 -->
        <div class="form-item">
          <label for="weight">몸무게 (kg)</label>
          <input type="number" id="weight" v-model="weight" placeholder="몸무게 입력" />
        </div>
  
        <!-- 일일 목표 소모 칼로리 -->
        <div class="form-item">
          <label for="goal-calories">일일 목표 소모 칼로리</label>
          <input
            type="number"
            id="goal-calories"
            v-model="goalCalories"
            placeholder="칼로리 입력"
          />
        </div>
  
        <!-- 비밀번호 수정 -->
        <div class="form-item">
          <label for="password">비밀번호</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="비밀번호 입력"
          />
        </div>
  
        <!-- 저장 버튼 -->
        <button @click="saveChanges">저장</button>
  
        <!-- 뒤로가기 버튼 -->
        <button class="back-button" @click="goBack">뒤로가기</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "EditUserInfo",
    data() {
      return {
        gender: "male",
        height: "",
        weight: "",
        goalCalories: "",
        password: "",
      };
    },
    methods: {
      saveChanges() {
        console.log("회원 정보 저장됨", {
          gender: this.gender,
          height: this.height,
          weight: this.weight,
          goalCalories: this.goalCalories,
          password: this.password,
        });
        alert("회원 정보가 저장되었습니다!");
      },
      goBack() {
        this.$router.push({ name: "Setting" });
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

  
  .form-container {
    background: rgb(255, 255, 255, 0.9);
    padding: 40px;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    text-align: center;
    width: 80%;
    max-width: 400px;
    margin: 10% auto 0 auto; /* 기존 15%에서 10%로 조정 */
    transform: translateY(-15%); /* 추가: 폼을 더 위로 올림 */
  }
  
  h2 {
    font-size: 24px;
    margin-bottom: 20px;
    color: #333;
  }
  
  .form-item {
    margin: 20px 0;
    text-align: left;
  }
  
  label {
    font-size: 16px;
    display: block;
    margin-bottom: 10px;
  }
  
  input[type="number"],
  input[type="password"],
  select {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 5px;
    margin-bottom: 10px;
  }
  
  button {
    padding: 10px 20px;
    font-size: 16px;
    color: white;
    background-color: #28a745;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin: 10%;
  }
  
  button:hover {
    background-color: #218838;
  }
  
  .back-button {
    background-color: #28a745;
    margin-top: 10px;
  }
  
  .back-button:hover {
    background-color: #218838;
  }
  </style>
  