<template>
  <div class="container">
    <h1>MoveNet 실시간 자세 인식 및 게임 화면</h1>

    <!-- 난이도 및 배경 선택 -->
    <div v-if="!animationRunning && countdown === null && !gameOver" class="settings-selection">
      <h2>난이도 선택</h2>
      <div>
        <button @click="selectDifficulty('easy')">쉬움</button>
        <button @click="selectDifficulty('normal')">보통</button>
        <button @click="selectDifficulty('hard')">어려움</button>
      </div>
      <h2>배경 선택</h2>
      <div>
        <button @click="selectBackground('default')">해변</button>
        <button @click="selectBackground('soccer')">자두랑 축구</button>
        <button @click="selectBackground('ocean')">바다이야기</button>
        <button @click="selectBackground('home')">떡잎마을</button>
      </div>
      <button @click="startGame" :disabled="!difficulty || !backgroundSelected">게임 시작</button>
    </div>

    <!-- 게임 화면 -->
    <div class="game-container" v-if="animationRunning || countdown !== null || gameOver">
      <canvas ref="gameCanvas"></canvas>
      <img :src="characterSrc" :style="characterStyle" alt="character" class="character" />
      <div v-if="showCoin" class="coin-display">
        <img :src="coinGif" alt="Coin" />
      </div>
      <div v-if="countdown > 0" class="countdown">{{ countdown }}</div>
      <div v-else-if="countdown === 0 && !gameOver" class="start-text">Start!</div>
      <div v-if="gameOver" class="game-over-image">
        <img src="@/assets/GameOver.png" alt="Game Over" />
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
    <div class="tracking-container">
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
      selectedMap: 'default',
      caloriesBurned: 0,
      lastKeypointPosition: null,
      spawnInterval: 1000,
      fixedBallSize: 50,
      currentStage: 1,
      stageTimer: null,
      timeRemaining: 20,
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
      this.timeRemaining = 60; // 스테이지 시간 초기화
      clearInterval(this.stageTimer); // 기존 타이머 정리

      this.stageTimer = setInterval(() => {
          this.timeRemaining -= 1;
          if (this.timeRemaining <= 0) {
              clearInterval(this.stageTimer);
              this.nextStage(); // 시간이 끝나면 다음 스테이지로 이동
          }
      }, 1000);
    },
    nextStage() {
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
      console.log("coin")
      this.showCoin = true; // 코인 표시 활성화
    },
    endGame(victory) {
      this.animationRunning = false;
      this.gameOver = true;
      clearInterval(this.stageTimer);

      if (victory) {
        alert('모든 스테이지 완료! 축하합니다!');
      } else {
        const useCoin = confirm(
          `게임 오버! 보유 코인: ${this.coins}개. 코인을 사용하여 스테이지 ${this.currentStage}부터 재시작하시겠습니까?`
        );
        if (useCoin && this.coins > 0) {
          this.coins -= 1; // 코인 사용
          this.gameOver = false;
          this.initializeStage(); // 현재 스테이지 재시작
          this.animationRunning = true;
          this.gameLoop();
        } else {
          alert('게임을 다시 시작하려면 "게임 시작"을 눌러주세요.');
        }
      }
    },
    async setupCamera() {
      const video = this.$refs.video;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
        });
        video.srcObject = stream;
        return new Promise((resolve) => {
          video.onloadedmetadata = () => {
            video.play();
            resolve();
          };
        });
      } catch (error) {
        console.error('카메라 접근 오류:', error);
        alert('카메라에 접근할 수 없습니다. 권한을 확인하거나 HTTPS 환경에서 실행해주세요.');
      }
    },
    async loadMoveNet() {
      await tf.ready();
      const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );
      this.detectPose(detector);
    },
    async detectPose(detector) {
      const video = this.$refs.video;
      const trackingCanvas = this.$refs.trackingCanvas;

      if (!trackingCanvas) {
        console.error('Tracking Canvas가 로드되지 않았습니다.');
        return;
      }

      const ctx = trackingCanvas.getContext('2d');
      trackingCanvas.width = video.videoWidth;
      trackingCanvas.height = video.videoHeight;

      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-trackingCanvas.width, 0);

      const poses = await detector.estimatePoses(video, { flipHorizontal: false });
      ctx.clearRect(0, 0, trackingCanvas.width, trackingCanvas.height);

      if (poses && poses.length > 0) {
        this.drawKeypoints(ctx, poses[0].keypoints);
        this.drawSkeleton(ctx, poses[0].keypoints);
        this.updateCharacterPosition(poses[0].keypoints);
        this.calculateCalories(poses[0].keypoints);

        if (!this.personDetected) {
          this.personDetected = true;
          this.startCountdown();
        }
      }

      ctx.restore();

      if (this.animationRunning) {
        requestAnimationFrame(() => this.detectPose(detector));
      } else {
        requestAnimationFrame(() => this.detectPose(detector));
      }
    },
    startCountdown() {
      this.countdown = 3;
      const countdownInterval = setInterval(() => {
        this.countdown -= 1;
        if (this.countdown === 0) {
          clearInterval(countdownInterval);
          this.animationRunning = true;
          this.gameLoop();
          setTimeout(() => {
            this.countdown = -1;
          }, 1000);
        }
      }, 1000);
    },
    initializeBalls() {
      this.balls = [];
    },
    spawnBall() {
      if (this.balls.length >= this.numBalls) return;

      const canvasWidth = window.innerWidth;
      const ballX = Math.random() * (canvasWidth - this.fixedBallSize); // 공의 x 좌표 설정
      const ballSpeed = Math.random() * this.maxSpeed + 2; // 공 속도 설정

      let ballImage;
      if (this.selectedMap === 'ocean') {
          ballImage = trashImage; // 바다 배경에서는 쓰레기
      } else if (this.selectedMap === 'home') {
          const pepperImages = [yellowPepperImage, greenPepperImage];
          ballImage = pepperImages[Math.floor(Math.random() * pepperImages.length)];
      } else if (this.selectedMap === 'default') {
          ballImage = meteoriteImage; // 기본 배경에서는 운석
      } else {
          ballImage = ballImageSrc; // 기본 공
      }

      this.balls.push({
          x: ballX,
          y: 0,
          radius: this.fixedBallSize,
          speed: ballSpeed,
          image: ballImage,
          rotation: 0,
          rotationSpeed: Math.random() * 0.1 + 0.05, // 공 회전 속도
      });
    },
    gameLoop() {
      const gameCanvas = this.$refs.gameCanvas;
      if (!gameCanvas) return;

      const ctx = gameCanvas.getContext('2d');
      gameCanvas.width = window.innerWidth;
      gameCanvas.height = window.innerHeight;

      const bgImage = new Image();
      bgImage.src = this.bgImageSrc; // 배경 이미지 적용
      ctx.drawImage(bgImage, 0, 0, gameCanvas.width, gameCanvas.height);

      if (this.animationRunning) {
          if (!this.spawnTimer) {
              clearInterval(this.spawnTimer); // 이전 스폰 타이머 초기화
              this.spawnTimer = setInterval(() => this.spawnBall(), this.spawnInterval);
          }

          this.updateBallsPosition(ctx); // 공 위치 업데이트
          this.checkCollision(); // 충돌 체크

          requestAnimationFrame(() => this.gameLoop());
      } else {
          clearInterval(this.spawnTimer); // 애니메이션 정지 시 타이머 초기화
          this.spawnTimer = null;
      }
    },
    advanceLevel() {
      this.currentLevel++;
      this.numBalls += 2;
      this.initializeBalls();
    },
    updateBallsPosition(ctx) {
      this.balls.forEach((ball, index) => {
        ball.y += ball.speed;
        ball.rotation += ball.rotationSpeed;

        if (ball.y - ball.radius > ctx.canvas.height) {
          this.balls.splice(index, 1);
        } else {
          const ballImg = new Image();
          ballImg.src = ball.image;

          ctx.save();
          ctx.translate(ball.x, ball.y);
          ctx.rotate(ball.rotation);
          const ballSize = (this.fixedBallSize / 1000) * ctx.canvas.width;
          ctx.drawImage(ballImg, -ballSize / 2, -ballSize / 2, ballSize, ballSize);
          ctx.restore();
        }
      });
    },
    drawKeypoints(ctx, keypoints) {
      keypoints.forEach((point) => {
        if (point.score > 0.5) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
          ctx.fillStyle = 'red';
          ctx.fill();
        }
      });
    },
    drawSkeleton(ctx, keypoints) {
      const adjacentKeyPoints = poseDetection.util.getAdjacentPairs(
        poseDetection.SupportedModels.MoveNet
      );
      ctx.strokeStyle = 'blue';
      adjacentKeyPoints.forEach(([i, j]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];

        if (kp1.score > 0.5 && kp2.score > 0.5) {
          ctx.beginPath();
          ctx.moveTo(kp1.x, kp1.y);
          ctx.lineTo(kp2.x, kp2.y);
          ctx.stroke();
        }
      });
    },
    checkCollision() {
      this.balls.forEach((ball) => {
        const characterCenterX = this.characterX + this.characterSize / 2;
        const characterCenterY = this.characterY + this.characterSize / 2;

        const dx = ball.x - characterCenterX;
        const dy = ball.y - characterCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ball.radius + this.characterSize / 2) {
          this.animationRunning = false;
          this.gameOver = true;
        }
      });
    },
    updateCharacterPosition(keypoints) {
      const leftShoulder = keypoints.find((point) => point.name === 'left_shoulder');
      const rightShoulder = keypoints.find((point) => point.name === 'right_shoulder');

      if (leftShoulder && rightShoulder && leftShoulder.score > 0.5 && rightShoulder.score > 0.5) {
        const userX = (leftShoulder.x + rightShoulder.x) / 2;

        if (this.initialUserX === null) {
          this.initialUserX = userX;
        }

        const deltaX = -(userX - this.initialUserX) * 3;
        const maxX = window.innerWidth - this.characterSize;
        const minX = 0;
        const newCharacterX = window.innerWidth / 2 + deltaX;

        this.characterX = Math.min(maxX, Math.max(minX, newCharacterX));

        const newCharacterY = window.innerHeight - this.characterSize - 110;
        this.characterY = newCharacterY;
      }
    },
    calculateCalories(keypoints) {
      const leftShoulder = keypoints.find((point) => point.name === 'left_shoulder');
      const rightShoulder = keypoints.find((point) => point.name === 'right_shoulder');

      if (leftShoulder && rightShoulder && leftShoulder.score > 0.5 && rightShoulder.score > 0.5) {
        const currentPosition = (leftShoulder.y + rightShoulder.y) / 2;

        if (this.lastKeypointPosition !== null) {
          const delta = Math.abs(currentPosition - this.lastKeypointPosition);

          if (delta > 3) {
            this.caloriesBurned += delta * 0.0001;
          }
        }

        this.lastKeypointPosition = currentPosition;
      }
    },
  },

};


</script>

<style scoped>
.container {
  position: relative;
  overflow: hidden;
}

.settings-selection {
  text-align: center;
  margin: 20px;
}

.settings-selection button {
  margin: 5px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

.game-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
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

.game-over-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  text-align: center;
}

.game-over-image img {
  max-width: 80%;
  height: auto;
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
  color: #ff0000;
  text-align: center;
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


</style>