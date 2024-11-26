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
  
      const accessToken = response.data["access-token"];
      const user = response.data.user;
  
      if (!accessToken || !user) {
        throw new Error("Invalid response structure");
      }
  
      sessionStorage.setItem("access-token", accessToken);
      sessionStorage.setItem("user-id", user.userId);
      sessionStorage.setItem("user-data", JSON.stringify(user));
  
      console.log("Saved access-token:", sessionStorage.getItem("access-token"));
      console.log("Saved user-id:", sessionStorage.getItem("user-id"));
  
      if (accessToken.split(".").length === 3) {
        const tokenPayload = JSON.parse(atob(accessToken.split(".")[1]));
        loginUser.value = tokenPayload.name || user.username || user.userId;
        console.log("로그인 성공! 사용자 이름:", loginUser.value);
      } else {
        throw new Error("Invalid JWT format");
      }
  
      router.push({ name: "Home" });
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("로그인에 실패했습니다. 다시 시도해주세요.");
    }
  };
  
  const restoreSession = () => {
    const accessToken = sessionStorage.getItem("access-token");
    const userId = sessionStorage.getItem("user-id");
    const userData = sessionStorage.getItem("user-data");
  
    if (accessToken && userId && userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        loginUser.value = parsedUserData.username || parsedUserData.userId;
        signupData.value = parsedUserData;
        console.log("Session 복구 성공! 사용자:", loginUser.value);
      } catch (error) {
        console.error("Session 복구 실패:", error);
      }
    }
  };
  
  // 애플리케이션 시작 시 복구
  restoreSession();  

  
  const fetchUserData = () => {
    const userId = sessionStorage.getItem("user-id");
    const userData = sessionStorage.getItem("user-data");

    if (!userId || !userData) {
      alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
      router.push({ name: "Login" });
      return;
    }

    try {
      const parsedUserData = JSON.parse(userData);
      signupData.value = parsedUserData;
      loginUser.value = parsedUserData.username || parsedUserData.userId;
    } catch (error) {
      console.error("사용자 데이터 파싱 실패:", error);
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
    fetchUserData,
    handleRightButtonClick,
    handleLeftButtonClick,
  };
});
