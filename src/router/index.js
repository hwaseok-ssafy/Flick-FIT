import { createRouter, createWebHistory } from 'vue-router';
import Start from '@/components/Start.vue';
import VideoPose from '@/components/VideoPose.vue';
import Login from '@/components/Login.vue';
import Signup from '@/components/Signup.vue';
import GameGuide from '@/components/GameGuide.vue';
import Home from '@/components/Home.vue';
import Setting from '@/components/Setting.vue';
import EditUserInfo from '@/components/EditUserInfo.vue'; // 추가된 회원 정보 수정 컴포넌트
import GameResult from '@/components/GameResult.vue';

const routes = [
  {
    path: '/',
    name: 'Start',
    component: Start, // 초기 페이지
  },
  {
    path: '/videopose',
    name: 'VideoPose',
    component: VideoPose, // VideoPose 페이지
  },
  {
    path: '/login',
    name: 'Login',
    component: Login, // Login 페이지
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup, // Signup 페이지
  },
  {
    path: '/home',
    name: 'Home',
    component: Home, // Home 페이지
  },
  {
    path: '/gameguide',
    name: 'GameGuide',
    component: GameGuide, // GameGuide 페이지
  },
  {
    path: '/setting',
    name: 'Setting',
    component: Setting, // Setting 페이지
  },
  {
    path: '/edituserinfo', // 회원 정보 수정 페이지 경로 추가
    name: 'EditUserInfo',
    component: EditUserInfo, // EditUserInfo 페이지
  },
  {
    path: '/gmaeresult', // 게임 결과 페이지 추가
    name: 'GameResult',
    component: GameResult, // 게임 결과 페이지
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem("access-token");
  if (to.name !== "Login" && to.name !== "Signup" && to.name !== "Start" && !token) {
    next({ name: "Start" });
  } else {
    next();
  }
});

export default router;