<template>
  <div class="container">
    <h1>Flick-FIT</h1>

    <!-- 배경 선택 -->
    <div v-if="!backgroundSelected && !difficultySelected" class="settings-container">
      <div class="overlay">
        <h2>테마 선택</h2>
        <div class="button-group">
          <button @click="selectBackground('default')">해변</button>
          <button @click="selectBackground('soccer')">자두랑 축구</button>
          <button @click="selectBackground('ocean')">바다이야기</button>
          <button @click="selectBackground('home')">떡잎마을</button>
        </div>
      </div>
    </div>

    <!-- 난이도 선택 -->
    <div v-else-if="backgroundSelected && !difficultySelected" class="settings-container">
      <div class="overlay">
        <h2>모드 선택</h2>
        <div class="button-group">
          <button @click="selectDifficulty('easy')">쉬움</button>
          <button @click="selectDifficulty('normal')">보통</button>
          <button @click="selectDifficulty('hard')">어려움</button>
        </div>
      </div>
    </div>

    <!-- 게임 시작 -->
    <div v-else class="settings-container">
      <div class="overlay">
        <button class="start-button" @click="startGame">게임 시작</button>
      </div>
    </div>

    <!-- 게임 화면 -->
    <div class="game-container" v-if="animationRunning || countdown !== null || gameOver">
      <canvas ref="gameCanvas"></canvas>
      <img :src="characterSrc" :style="characterStyle" alt="character" class="character" />

      <!-- 코인 애니메이션 표시 -->
      <div v-if="showCoin && !gameOver" class="coin-display">
        <img :src="coinGif" alt="Coin" />
      </div>

      <div v-if="countdown > 0" class="countdown">{{ countdown }}</div>
      <div v-else-if="countdown === 0 && !gameOver" class="start-text">Start!</div>

      <!-- 게임 오버 화면 -->
      <div v-show="gameOver" class="game-over-container">
        <div class="game-over-image">
          <img src="@/assets/GameOver.png" alt="Game Over" />
        </div>
        <div class="game-over-buttons">
          <button @click="restartFromCurrentStage">Retry</button>
          <button @click="restartGame">Again Play</button>
          <button @click="exitGame">Exit</button>
        </div>
      </div>

      <!-- 일시정지 메뉴 -->
      <div v-if="showPauseMenu" class="pause-menu-overlay">
        <div class="pause-menu">
          <h2>Menu</h2>
          <button @click="togglePause">Continue</button>
          <button @click="changeMode">Mode</button>
          <button @click="changeTheme">Theme</button>
          <button @click="restartFromStageOne">Restart</button>
        </div>
      </div>

      <div class="calories-burned">{{ caloriesBurned.toFixed(2) }} kcal</div>

      <!-- 스테이지 및 타이머 -->
      <div class="stage-display" v-if="animationRunning && !gameOver">
        <span>STAGE {{ currentStage }}</span>
        <div class="coin-count">
          <img src="@/assets/coin.gif" alt="Coin" class="coin-icon" />
          <span>{{ coins }}</span>
        </div>
      </div>
      <div class="timer-display" v-if="animationRunning && !gameOver">
        {{ timeRemaining }}초
      </div>
    </div>

    <!-- MoveNet 인식 화면 (좌측 상단 고정) -->
    <div class="tracking-container" v-show="backgroundSelected && difficultySelected && !gameOver && !isPaused">
      <video ref="video" autoplay playsinline></video>
      <canvas ref="trackingCanvas"></canvas>
    </div>
  </div>
</template>


<script>
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import ballImage from '@/assets/Ball.png';
import bgImage from '@/assets/BgBall.jpg';
import soccerBg from '@/assets/soccer_back.jpg';
import oceanBg from '@/assets/ocean_back.jpg';
import homeBg from '@/assets/home_back.jpg';
import trashImage from '@/assets/trash.png';
import yellowPepperImage from '@/assets/yellowpepper.png';
import greenPepperImage from '@/assets/greenpepper.png';
import meteoriteImage from '@/assets/meteorite.png';

import characterImage from '@/assets/Alian.png';
import zzangGooImage from '@/assets/zzangGoo.png';
import jadooImage from '@/assets/jadoo.png';
import turtleImage from '@/assets/turtle.png';

import coinGif from '@/assets/coin.gif';

export default {
  name: 'VideoPose',
  data() {
    const characterSize = window.innerHeight * 0.12;
    return {
      showCoin: false, // 코인 표시 여부
      coinGif: coinGif, // coinGif를 data에 등록
      coins: 0, // 현재 보유 코인 수
      stageCoins: 0, // 스테이지 클리어로 획득한 코인 수

      isPaused: false, // 일시정지 상태
      showPauseMenu: false, // 일시정지 메뉴 표시 여부

      balls: [],
      animationRunning: false,
      gameOver: false,
      countdown: null,
      characterSrc: characterImage,
      characterX: window.innerWidth / 2,
      characterY: window.innerHeight - characterSize - 110,
      characterSize: characterSize,
      numBalls: 5,
      personDetected: false,
      currentLevel: 1,
      maxLevel: 10,
      difficulty: '',
      initialUserX: null,
      ballImageSrc: ballImage,
      bgImageSrc: bgImage,
      backgroundSelected: false,
      difficultySelected: false,
      selectedMap: 'default',
      caloriesBurned: 0,
      lastKeypointPosition: null,
      spawnInterval: 1000,
      fixedBallSize: 50,
      currentStage: 1,
      stageTimer: null,
      timeRemaining: 60,
      isTimerPaused: false, // 타이머가 일시정지 상태인지 여부
      stageConfig: {
        easy: [
          { numBalls: 5, maxSpeed: 2 },
          { numBalls: 7, maxSpeed: 3 },
          { numBalls: 10, maxSpeed: 4 },
          { numBalls: 12, maxSpeed: 5 },
          { numBalls: 15, maxSpeed: 6 },
        ],
        normal: [
          { numBalls: 7, maxSpeed: 3 },
          { numBalls: 10, maxSpeed: 4 },
          { numBalls: 12, maxSpeed: 5 },
          { numBalls: 15, maxSpeed: 6 },
          { numBalls: 20, maxSpeed: 8 },
        ],
        hard: [
          { numBalls: 10, maxSpeed: 4 },
          { numBalls: 15, maxSpeed: 6 },
          { numBalls: 20, maxSpeed: 8 },
          { numBalls: 25, maxSpeed: 10 },
          { numBalls: 30, maxSpeed: 12 },
        ],
      },
    };
  },
  computed: {
    characterStyle() {
      return {
        position: 'absolute',
        left: `${this.characterX}px`,
        top: `${this.characterY}px`,
        width: `${this.characterSize}px`,
        height: `${this.characterSize}px`,
        transition: 'left 0.1s, top 0.1s',
      };
    },
  },
  methods: {
    selectDifficulty(difficulty) {
      this.difficulty = difficulty;
      this.setGameDifficulty();
      this.difficultySelected = true;
    },
    selectBackground(background) {
      this.selectedMap = background;
      if (background === 'soccer') {
        this.bgImageSrc = soccerBg;
        this.characterSrc = jadooImage;
        this.characterSize = 200;
      } else if (background === 'ocean') {
        this.bgImageSrc = oceanBg;
        this.characterSrc = turtleImage;
        this.characterSize = 160;
      } else if (background === 'home') {
        this.bgImageSrc = homeBg;
        this.characterSrc = zzangGooImage;
        this.characterSize = 155;
      } else {
        this.bgImageSrc = bgImage;
        this.characterSrc = characterImage;
        this.characterSize = 145;
      }
      this.backgroundSelected = true;
    },
    async startGame() {
      this.gameOver = false;
      this.currentStage = 1;
      await this.setupCamera();
      await this.loadMoveNet();
      this.startCountdown();
      this.initializeStage();
    },
    setGameDifficulty() {
      this.numBalls = 5;
      if (this.difficulty === 'easy') {
        this.spawnInterval = 1500;
        this.maxSpeed = 2;
      } else if (this.difficulty === 'normal') {
        this.spawnInterval = 1000;
        this.maxSpeed = 4;
      } else if (this.difficulty === 'hard') {
        this.spawnInterval = 700;
        this.maxSpeed = 6;
      }
      this.initializeBalls();
    },
    initializeStage() {
      const stageSettings = this.stageConfig[this.difficulty][this.currentStage - 1];
      this.numBalls = stageSettings.numBalls; // 스테이지별 공 개수 설정
      this.maxSpeed = stageSettings.maxSpeed; // 스테이지별 최대 속도 설정
      this.spawnInterval = 1000 / this.maxSpeed; // 속도에 비례하여 스폰 주기 설정

      this.balls = []; // 공 배열 초기화
      this.initializeBalls(); // 새로운 공 배열 생성
      this.startStageTimer(); // 스테이지 타이머 시작
    },
    startStageTimer() {
      if (this.isTimerPaused) {
        // 타이머가 일시정지 상태라면, 재개
        this.isTimerPaused = false;
      } else {
        // 새로 시작
        this.timeRemaining = 60; // 초기 시간 설정 (필요시 조정)
      }

      clearInterval(this.stageTimer); // 기존 타이머 클리어

      this.stageTimer = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining -= 1; // 1초씩 감소
        } else {
          clearInterval(this.stageTimer);
          this.nextStage(); // 시간이 끝나면 다음 스테이지로 이동
        }
      }, 1000);
    },
    pauseStageTimer() {
      // 타이머 일시정지
      if (this.stageTimer) {
        clearInterval(this.stageTimer);
        this.isTimerPaused = true; // 타이머가 일시정지 상태임을 기록
      }
    },
    nextStage() {
      if (this.gameOver) return; // 게임 종료 상태라면 실행 중단

      if (this.currentStage < 5) {
        this.animationRunning = false; // 게임 루프 일시 정지
        this.stageCoins += 1; // 스테이지 클리어 시 코인 획득
        this.coins += 1; // 보유 코인 업데이트
        this.displayCoin(); // 코인 애니메이션 표시

        setTimeout(() => {
          this.showCoin = false; // 코인 숨기기
          this.currentStage++; // 다음 스테이지로 이동
          this.initializeStage(); // 스테이지 재설정
          this.animationRunning = true; // 게임 루프 재개
          this.gameLoop(); // 새로 시작
        }, 4000); // 4초 후 다음 스테이지로 이동
      } else {
        this.endGame(true); // 모든 스테이지 완료 처리
      }
    },
    displayCoin() {
      console.log("coin");
      this.showCoin = true; // 코인 표시 활성화

      setTimeout(() => {
        this.showCoin = false; // 2초 후 코인 숨기기
      }, 4000); // 코인이 표시될 시간 (2초)
    },
    endGame(victory) {
      this.animationRunning = false;
      clearInterval(this.stageTimer);
      this.gameOver = true;
      this.showCoin = false; // 코인 표시 비활성화
      console.log('게임 오버 상태:', this.gameOver);

      if (victory) {
        alert('모든 스테이지 완료! 축하합니다!');
      } else {
        alert('게임 오버! 버튼을 선택해 재시작하거나 종료하세요.');
      }
    },
    // Other methods remain untouched for brevity...
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeyDown);
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
  },
};
</script>


<style scoped>
* {
 margin: 0;
 padding: 0;
 box-sizing: border-box;
}

html,
body {
 margin: 0;
 padding: 0;
 width: 100%;
 height: 100%;
 overflow: hidden;
}

/* 기본 컨테이너 스타일 */
.container {
 position: relative;
 margin: 0;
 padding: 0;
 width: 100vw;
 height: 100vh;
 overflow: hidden;
 font-family: 'Arial', sans-serif;
}

/* 제목 스타일 */
h1 {
 position: absolute;
 top: 40px;
 left: 50%;
 transform: translateX(-50%);
 font-size: 55px;
 color: #F6F9A2;
 text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
}

.settings-container {
 width: 100%;
 height: 100%;
 margin: 0;
 padding: 0;
 display: flex;
 align-items: center;
 justify-content: center;
 background: url('@/assets/BgBall.jpg') no-repeat center center; /* 가운데 정렬 */
 background-size: cover; /* 배경 크기를 화면에 맞게 조정 */
}

/* 오버레이 스타일 */
.overlay {
 text-align: center;
 background: rgb(255, 255, 255);
 padding: 40px;
 border-radius: 15px;
 box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

/* 제목 스타일 */
.overlay h2 {
 font-size: 28px;
 color: #000000;
 margin-bottom: 20px;
 font: bold;
}

.game-container {
 position: fixed;
 top: 0;
 left: 0;
 width: 100vw;
 height: 100vh;
 background-color: #f0f0f0;
 z-index: 1;
}

.calories-burned {
 position: fixed;
 top: 10px;
 right: 10px;
 font-size: 24px;
 font-weight: bold;
 color: #ff4500;
 background-color: rgba(255, 255, 255, 0.8);
 padding: 10px;
 border-radius: 10px;
 z-index: 3;
}

/* 버튼 그룹 */
.button-group {
 display: flex;
 flex-wrap: wrap;
 justify-content: center;
}

/* 버튼 스타일 */
.button-group button {
 background-color: #ffd700;
 border: none;
 border-radius: 10px;
 color: #000;
 font-size: 18px;
 font-weight: bold;
 margin: 10px;
 padding: 15px 30px;
 cursor: pointer;
 transition: transform 0.3s, background-color 0.3s;
 box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.button-group button:hover {
 transform: scale(1.1);
 background-color: #ffa500;
}

.game-over-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8); /* 배경을 어둡게 */
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.game-over-image img {
  max-width: 300px; /* 고정된 이미지 크기 */
  height: auto;
  margin-bottom: 20px; /* 이미지와 버튼 사이 여백 */
}

.game-over-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px; /* 버튼 간격 고정 */
}

.game-over-buttons button {
  width: 200px; /* 버튼 너비 고정 */
  height: 50px; /* 버튼 높이 고정 */
  font-size: 16px; /* 글자 크기 고정 */
  border-radius: 8px; /* 약간 둥근 모서리 */
  background-color: #ff4500;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.game-over-buttons button:hover {
  background-color: #ff6347;
  transform: scale(1.05); /* 버튼 크기 확대 */
}


.tracking-container {
 position: fixed;
 top: 0;
 left: 0;
 width: 240px;
 height: 140px;
 background-color: rgba(255, 255, 255, 0.8);
 border: 2px solid #333;
 z-index: 2;
 box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* 게임 시작 버튼 스타일 */
.start-button {
 padding: 15px 50px;
 font-size: 20px;
 font-weight: bold;
 background-color: #28a745;
 border: none;
 border-radius: 10px;
 color: #ffffff;
 cursor: pointer;
 transition: transform 0.3s, background-color 0.3s;
 box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.start-button:hover {
 transform: scale(1.1);
 background-color: #218838;
}

video,
#trackingCanvas {
 width: 100%;
 height: 100%;
}

video {
 transform: scaleX(-1);
}

.character {
 position: absolute;
}

.countdown,
.start-text {
 position: absolute;
 top: 50%;
 left: 50%;
 transform: translate(-50%, -50%);
 font-size: 48px;
 font-weight: bold;
 color: white;
 text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
}

.stage-info {
 position: fixed;
 top: 10px;
 left: 10px;
 font-size: 20px;
 font-weight: bold;
 color: #ffffff;
 background-color: rgba(0, 0, 0, 0.6);
 padding: 10px;
 border-radius: 10px;
 z-index: 3;
}

.stage-display {
 position: fixed;
 top: 10px;
 left: 50%;
 transform: translateX(-50%);
 font-size: 36px;
 font-weight: bold;
 color: #ffffff;
 background-color: rgba(0, 0, 0, 0.7);
 padding: 10px 20px;
 border-radius: 10px;
 z-index: 5; /* z-index를 높게 설정 */
 display: flex;
 align-items: center;
 gap: 15px;
}

.coin-count {
 display: flex;
 align-items: center;
 gap: 5px;
 font-size: 24px;
 color: #ffd700;
}

.coin-icon {
 width: 30px;
 height: auto;
}


.timer-display {
 position: fixed;
 top: 70px;
 right: 10px;
 font-size: 24px;
 font-weight: bold;
 color: #ffffff;
 background-color: rgba(0, 0, 0, 0.7);
 padding: 10px 20px;
 border-radius: 10px;
 z-index: 4;
 text-align: center;
}

.coin-display {
   position: fixed;
   top: 50%;
   left: 50%;
   transform: translate(-50%, -50%);
   z-index: 9999; /* 다른 요소보다 높게 설정 */
   animation: fade-in-out 2s ease-in-out forwards;
}

.coin-display img {
   width: 600px; /* 원하는 코인 크기 설정 */
   height: auto;
   animation: spin 3s linear infinite; /* 회전 효과 */
}

.pause-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.pause-menu {
  background-color: #fff;
  padding: 20px 40px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.pause-menu h2 {
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
}

.pause-menu button {
  display: block;
  width: 200px;
  margin: 10px auto;
  padding: 10px;
  font-size: 18px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.pause-menu button:hover {
  background-color: #0056b3;
}



@keyframes fade-in-out {
   0% {
       opacity: 0;
   }
   50% {
       opacity: 1;
   }
   100% {
       opacity: 0;
   }
}

@keyframes spin {
   0% {
       transform: translate(-50%, -50%) rotate(0deg);
   }
   100% {
       transform: translate(-50%, -50%) rotate(360deg);
   }
}

@media (max-width: 768px) {
  .game-over-buttons {
    gap: 1vh; /* 버튼 간격을 더 줄임 */
    width: 90%;
  }

  .game-over-buttons button {
    padding: 1vh 1.5vw; /* 버튼 크기를 더 작게 조정 */
    font-size: 1.8vh; /* 글꼴 크기 조정 */
  }

  .game-over-container {
    padding: 5vh 0;
  }
}

</style>