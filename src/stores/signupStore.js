import { defineStore } from "pinia";
import axios from "axios";

export const useSignupStore = defineStore("signup", {
  state: () => ({
    step: 1, // 현재 단계
    signupData: {
      username: "", // 아이디
      password: "", // 비밀번호
      name: "", // 사용자 이름
      height: null, // 키 (cm)
      weight: null, // 몸무게 (kg)
      age: null, // 나이
      gender: "", // 성별
      calorieGoal: null, // 소비 칼로리 목표
    },
  }),
  actions: {
    handleLeftButtonClick() {
      if (this.step > 1) {
        this.step--;
      }
    },
    handleRightButtonClick() {
      if (this.step < 8) {
        this.step++;
      } else {
        this.submitSignup();
      }
    },
    async submitSignup() {
      try {
        const response = await axios.post(
          "http://localhost:8080/userapi/user",
          this.signupData
        );

        if (response.status === 201) {
          console.log("회원가입 성공!");
          alert("회원가입이 완료되었습니다!");
          // 이후 페이지 이동 또는 초기화 작업
        } else {
          console.log("회원가입 실패:", response.status);
          alert("회원가입에 실패했습니다.");
        }
      } catch (error) {
        console.error("회원가입 오류:", error.message);
        alert("회원가입 중 오류가 발생했습니다.");
      }
    },
  },
});
