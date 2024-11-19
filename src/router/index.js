import { createRouter, createWebHistory } from 'vue-router';
import Start from '@/components/Start.vue';
import VideoPose from '@/components/VideoPose.vue';
import Login from '@/components/Login.vue'
import Signup from '@/components/Signup.vue';

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
    component: Login, // VideoPose 페이지
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup, // VideoPose 페이지
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
