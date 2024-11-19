import { defineStore } from "pinia";

export const useSignupStore = defineStore("signup", {
  state: () => ({
    step: 1,
    signupData: {
      username: "",
      password: "",
      name: "",
      height: null,
      weight: null,
      age: null,
      gender: "",
      calorieGoal: null,
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
    submitSignup() {
      console.log("회원가입 데이터:", this.signupData);
      // 실제 API 호출 로직 추가
    },
  },
});
