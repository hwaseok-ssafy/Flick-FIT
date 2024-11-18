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
      <div v-if="countdown > 0" class="countdown">{{ countdown }}</div>
      <div v-else-if="countdown === 0 && !gameOver" class="start-text">Start!</div>
      <div v-if="gameOver" class="game-over-image">
        <img src="@/assets/GameOver.png" alt="Game Over" />
      </div>
      <div class="calories-burned">{{ caloriesBurned.toFixed(2) }} kcal</div>

      <!-- 스테이지 및 타이머 정보 -->
      <div class="stage-info" v-if="animationRunning && !gameOver">
        <div>스테이지: {{ currentStage }}/5</div>
        <div>남은 시간: {{ timeRemaining }}초</div>
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

export default {
  name: 'VideoPose',
  data() {
    const characterSize = window.innerHeight * 0.12;
    return {
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
      timeRemaining: 60,
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
      this.numBalls = stageSettings.numBalls;
      this.maxSpeed = stageSettings.maxSpeed;
      this.initializeBalls();
      this.startStageTimer();
    },
    startStageTimer() {
      this.timeRemaining = 60;
      clearInterval(this.stageTimer);

      this.stageTimer = setInterval(() => {
        this.timeRemaining -= 1;
        if (this.timeRemaining <= 0) {
          clearInterval(this.stageTimer);
          this.nextStage();
        }
      }, 1000);
    },
    nextStage() {
      if (this.currentStage < 5) {
        this.currentStage++;
        this.initializeStage();
      } else {
        this.endGame(true);
      }
    },
    endGame(victory) {
      this.animationRunning = false;
      this.gameOver = true;
      clearInterval(this.stageTimer);
      if (victory) {
        alert('모든 스테이지 완료! 축하합니다!');
      } else {
        alert('게임 오버! 다시 도전하세요.');
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

      let image, speed;
      if (this.selectedMap === 'ocean') {
        image = trashImage;
        speed = Math.random() * this.maxSpeed + 2;
      } else if (this.selectedMap === 'home') {
        const pepperImages = [yellowPepperImage, greenPepperImage];
        image = pepperImages[Math.floor(Math.random() * pepperImages.length)];
        speed = Math.random() * this.maxSpeed + 3;
      } else if (this.selectedMap === 'default') {
        image = meteoriteImage;
        speed = Math.random() * this.maxSpeed + 1;
      } else {
        image = ballImage;
        speed = Math.random() * this.maxSpeed + 2;
      }

      this.balls.push({
        x: Math.random() * window.innerWidth,
        y: 0,
        radius: this.fixedBallSize,
        speed: speed,
        image: image,
        rotation: 0,
        rotationSpeed: Math.random() * 0.1 + 0.05,
      });
    },
    gameLoop() {
      const gameCanvas = this.$refs.gameCanvas;
      if (!gameCanvas) return;

      const ctx = gameCanvas.getContext('2d');
      gameCanvas.width = window.innerWidth;
      gameCanvas.height = window.innerHeight;

      const bgImage = new Image();
      bgImage.src = this.bgImageSrc;
      ctx.drawImage(bgImage, 0, 0, gameCanvas.width, gameCanvas.height);

      if (this.animationRunning) {
        if (!this.spawnTimer) {
          this.spawnTimer = setInterval(() => this.spawnBall(), this.spawnInterval);
        }

        this.updateBallsPosition(ctx);
        this.checkCollision();

        if (this.currentLevel < this.maxLevel && this.balls.length === 0) {
          this.advanceLevel();
        }

        requestAnimationFrame(this.gameLoop);
      } else {
        clearInterval(this.spawnTimer);
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
</style>