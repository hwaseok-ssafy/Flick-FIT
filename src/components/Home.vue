<template>
    <div id="app" class="app-container" tabindex="0">
        <div class="game-container">
          <!-- 로고 이미지 추가 -->
          <img src="@/assets/fit_logo.png" alt="Flick-FIT Logo" class="game-logo" />
          <p class="game-instruction"> G키를 눌러 게임을 시작하세요. <br> D 키를 눌러 게임 방법을 확인하세요. <br> S키를 눌러 환경설정으로 이동하세요.</p>
          <img src="@/assets/whitedog.png" alt="dog" class="dog"/>
        </div>
      </div>
    </template>
    
    <script>
export default {
  name: 'App',
  methods: {
    handleKeyDown(event) {
      switch (event.key.toLowerCase()) {
        case 'g': // G 키를 누르면 VideoPose.vue로 이동
          this.$router.push({ name: 'VideoPose' });
          break;
        case 's': // S 키를 누르면 Setting.vue로 이동
          this.$router.push({ name: 'Setting' });
          break;
        case 'd': // D 키를 누르면 GameGuide.vue로 이동
          this.$router.push({ name: 'GameGuide' });
          break;
        default:
          break;
      }
    },
  },
  mounted() {
    // 전역 키 이벤트 등록
    window.addEventListener('keydown', this.handleKeyDown);
  },
  beforeDestroy() {
    // 컴포넌트 해제 시 이벤트 제거
    window.removeEventListener('keydown', this.handleKeyDown);
  },
};
</script>

    
    <style scoped>
    /* 기본 HTML, BODY 스타일 초기화 */
    html, body {
      margin: 0;
      padding: 0;
      height: 100%; /* 화면 전체 높이 설정 */
      width: 100%; /* 화면 전체 너비 설정 */
      overflow: hidden; /* 스크롤 방지 */
    }
    
    #app {
      width: 100%;
      height: 100%;
    }
    
    /* 전체 컨테이너 스타일 */
  .app-container {
    display: flex;
    justify-content: center; /* 수평 정렬 */
    align-items: center; /* 수직 정렬 */
    flex-direction: column; /* 요소를 수직으로 배치 */
    width: 100vw;
    height: 100vh;
    background: url('@/assets/home_back.jpg') no-repeat center center;
    background-size: 100% 100%;
  }
    
    /* 게임 컨테이너 */
    .game-container {
      text-align: center;
      position: relative;
    }
    
    /* 로고 스타일 */
  /* 게임 로고 */
  .game-logo {
    position: absolute; /* 절대 위치 설정 */
    top: 2%; /* 로고의 세로 위치 */
    left: -42%; /* 화면의 왼쪽으로 이동 */
    width: 38vw; /* 로고 크기 */
    height: auto; /* 비율 유지 */
    animation: bounce 2s infinite;
  }

  .dog {
    position: absolute; /* 절대 위치 설정 */
    top: 79%; /* 로고의 세로 위치 */
    left: -50%; /* 화면의 왼쪽으로 이동 */
    width: 10vw; /* 로고 크기 */
    height: auto; /* 비율 유지 */
  }


  
  
    /* 애니메이션 */
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }
    
  /* 게임 설명 텍스트 */
  .game-instruction {
    margin-top: 70vh; /* 로고와의 간격 추가 */
    font-size: 1vw;
    font-weight: bold;
    color: #000000;
    background-color: rgba(255, 255, 255, 0.7);
    padding: 1.5vw 3vw;
    border-radius: 1vw;
    text-shadow: none;
    text-align: center; /* 텍스트 정렬 */
  }
  
  @media (max-width: 768px) {
    .game-logo {
      max-width: 40vw;
    }
  
    .game-instruction {
      font-size: 4vw;
      padding: 2vw 3vw;
      border-radius: 2vw;
    }
  }
  
  @media (max-width: 480px) {
    .game-logo {
      max-width: 50vw;
    }
  
    .game-instruction {
      font-size: 5vw;
      padding: 3vw 4vw;
      border-radius: 3vw;
    }
  }
  
    </style>