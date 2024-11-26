import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";
import router from "@/router"; // 라우터 사용을 위해 import

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api-game",
});

// JWT 토큰 가져오기
const getToken = () => {
  const jwtToken = sessionStorage.getItem("access-token");
  if (!jwtToken) {
    alert("인증 토큰이 없습니다. 다시 로그인해주세요.");
    throw new Error("JWT 토큰 누락");
  }
  return jwtToken;
};

// Axios 요청 인터셉터 추가 (토큰 추가)
axiosInstance.interceptors.request.use(
  (config) => {
    const jwtToken = getToken();
    config.headers.Authorization = `Bearer ${jwtToken}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios 응답 인터셉터 추가 (오류 처리)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      alert("인증 정보가 만료되었습니다. 다시 로그인해주세요.");
      sessionStorage.clear(); // 세션 초기화
      router.push({ name: "Login" }); // 로그인 페이지로 리다이렉트
    }
    return Promise.reject(error);
  }
);

export const useGameStore = defineStore("game", () => {
  const gameSessions = ref([]); // 게임 세션 리스트
  const dailyStats = ref(null); // 일일 통계 데이터
  const currentGameResult = ref(null); // 현재 게임 결과 데이터
  const loading = ref(false); // 로딩 상태

  // 게임 결과 저장
  const saveGameResult = async (gameSession) => {
    try {
      loading.value = true;

      const response = await axiosInstance.post("/game-over", gameSession);
      console.log("게임 결과 저장 성공:", response.data);
      currentGameResult.value = response.data; // API에서 반환된 현재 게임 결과 저장
      return response.data; // API 응답 반환
    } catch (error) {
      console.error("게임 결과 저장 실패:", error.response?.data || error.message);
      alert("게임 결과를 저장하는 중 오류가 발생했습니다.");
    } finally {
      loading.value = false;
    }
  };

  // 일일 통계 조회
  const fetchDailyStats = async (userId, goalCalories) => {
    try {
      loading.value = true;

      const response = await axiosInstance.get("/daily-stats", {
        params: { userId, goalCalories },
      });
      console.log("일일 통계 조회 성공:", response.data);
      dailyStats.value = response.data; // 통계 데이터 저장
    } catch (error) {
      console.error("일일 통계 조회 실패:", error.response?.data || error.message);
      alert("일일 통계를 가져오는 중 오류가 발생했습니다.");
    } finally {
      loading.value = false;
    }
  };

  // 게임 세션 목록 조회
  const fetchGameSessions = async (userId) => {
    try {
      loading.value = true;

      const response = await axiosInstance.get("/game-sessions", {
        params: { userId },
      });
      console.log("게임 세션 조회 성공:", response.data);
      gameSessions.value = response.data; // 게임 세션 리스트 저장
    } catch (error) {
      console.error("게임 세션 조회 실패:", error.response?.data || error.message);
      alert("게임 기록을 가져오는 중 오류가 발생했습니다.");
    } finally {
      loading.value = false;
    }
  };

  return {
    gameSessions,
    dailyStats,
    currentGameResult,
    loading,
    saveGameResult,
    fetchDailyStats,
    fetchGameSessions,
  };
});
