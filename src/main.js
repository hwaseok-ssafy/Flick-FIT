import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // 라우터 가져오기
import { createPinia } from 'pinia'; // Pinia 가져오기

import axios from 'axios';

axios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("access-token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});


const app = createApp(App);

// Pinia 초기화 및 등록
const pinia = createPinia();
app.use(pinia); // Pinia 등록

app.use(router); // 라우터 등록
app.mount('#app');
