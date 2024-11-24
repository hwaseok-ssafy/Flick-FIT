import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import router from "@/router";

const REST_API_URL = `http://localhost:8080/api-user`;

export const useUserStore = defineStore("user", () => {
  const loginUser = ref(null);
  const loginData = ref({ userId: "", password: "" });
  const signupData = ref({
    userId: "", // 'id'를 'userId'로 변경
    username: "",
    password: "",
    height: null,
    weight: null,
    age: null,
    gender: "",
    calorieGoal: null,
  });
  const step = ref(1);

  const login = async () => {
    console.log("Login Data:", loginData.value);
    try {
      const response = await axios.post(`${REST_API_URL}/login`, {
        userId: loginData.value.userId,
        password: loginData.value.password,
      });
      
      // 성공 응답 처리
      sessionStorage.setItem("access-token", response.data["access-token"]);
      sessionStorage.setItem("user-id", loginData.value.userId); // 사용자 ID 저장

      const token = response.data["access-token"].split(".");
      const payload = JSON.parse(atob(token[1]));
      loginUser.value = payload.name;
  
      router.push({ name: "Home" }); // 로그인 성공 시 이동
    } catch (error) {
      // 오류 응답 처리
      if (error.response) {
        console.error("로그인 실패 (서버 오류):", error.response.data);
        alert(error.response.data.message || "로그인 실패! 아이디와 비밀번호를 확인해주세요.");
      } else if (error.request) {
        console.error("로그인 실패 (응답 없음):", error.request);
        alert("서버 응답이 없습니다. 네트워크 상태를 확인하세요.");
      } else {
        console.error("로그인 실패 (설정 오류):", error.message);
        alert("요청 설정 중 오류가 발생했습니다.");
      }
    }
  };
  

  // 회원가입
  const signup = async () => {
    console.log("Signup Data:", signupData.value); // 전달되는 데이터 확인
    try {
      await axios.post(`${REST_API_URL}/signup`, {
        userId: signupData.value.userId, // 'id'를 'userId'로 수정
        password: signupData.value.password,
        username: signupData.value.username, // 'name'을 'username'으로 수정
        height: signupData.value.height,
        weight: signupData.value.weight,
        age: signupData.value.age,
        gender: signupData.value.gender,
        calorieGoal: signupData.value.calorieGoal,
      });
      sessionStorage.setItem("user-id", signupData.value.userId); // 회원가입 시 사용자 ID 저장
      alert("회원가입 성공! 로그인 페이지로 이동합니다.");
      router.push({ name: "Login" });
    } catch (error) {
      console.error("회원가입 실패:", error);
    }
  };

  // 단계 진행
  const handleRightButtonClick = () => {
    step.value++;
  };

  const handleLeftButtonClick = () => {
    if (step.value > 1) step.value--;
  };

  return {
    loginUser,
    loginData,
    signupData,
    step,
    login,
    signup,
    handleRightButtonClick,
    handleLeftButtonClick,
  };
});
