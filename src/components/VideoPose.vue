<template>
  <div class="container">
    <h1>MoveNet 실시간 자세 인식 및 게임 화면</h1>
    
    <!-- 난이도 및 배경 선택 -->
    <div v-if="!animationRunning && countdown === null" class="settings-selection">
      <h2>난이도 선택</h2>
      <div>
        <button v-for="level in 5" :key="'easy' + level" @click="selectDifficulty('easy', level)">쉬움 {{ level }}</button>
        <button v-for="level in 5" :key="'medium' + level" @click="selectDifficulty('medium', level)">보통 {{ level }}</button>
        <button v-for="level in 5" :key="'hard' + level" @click="selectDifficulty('hard', level)">어려움 {{ level }}</button>
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
    <div class="game-container" v-if="animationRunning || countdown !== null">
      <canvas ref="gameCanvas"></canvas>
      <img :src="characterSrc" :style="characterStyle" alt="character" class="character" />
      <div v-if="countdown > 0" class="countdown">{{ countdown }}</div>
      <div v-else-if="countdown === 0" class="start-text">Start!</div>
      <div class="calories-burned">{{ caloriesBurned.toFixed(2) }} kcal</div>
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
import characterImage from '@/assets/Alian.png';
import ballImage from '@/assets/Ball.png';
import bgImage from '@/assets/BgBall.jpg';
import soccerBg from '@/assets/soccer_back.jpg';
import oceanBg from '@/assets/ocean_back.jpg';
import homeBg from '@/assets/home_back.jpg';

import zzangGooImage from '@/assets/zzangGoo.png';
import jadooImage from '@/assets/jadoo.jpg';



export default {
  name: 'VideoPose',
  data() {
    const characterSize = window.innerHeight * 0.12; // 화면 높이의 12%를 캐릭터 크기로 설정
    return {
      balls: [],
      animationRunning: false,
      countdown: null,
      characterSrc: characterImage,
      characterX: window.innerWidth / 2,
      characterY: window.innerHeight - characterSize - 95, // 하단에서 20px 띄운 위치
      characterSize: characterSize,
      numBalls: 5,
      personDetected: false,
      currentLevel: 1, // 현재 게임 단계
      maxLevel: 10, // 최대 단계
      difficulty: '', // 난이도 설정 (쉬움, 보통, 어려움)
      difficultyLevel: 1, // 난이도 단계 (1-5)
      initialUserX: null, // 최초 사용자의 X 좌표를 저장
      ballImageSrc: ballImage,
      bgImageSrc: bgImage,
      backgroundSelected: false, // 배경 선택 여부
      caloriesBurned: 0, // 소모된 칼로리 양
      lastKeypointPosition: null, // 마지막 keypoint 위치
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
    selectDifficulty(difficulty, level) {
      this.difficulty = difficulty;
      this.difficultyLevel = level;
      this.setGameDifficulty();
    },
    selectBackground(background) {
        if (background === 'soccer') {
            this.bgImageSrc = soccerBg;
            this.characterSrc = jadooImage; // soccer 배경일 때 캐릭터 설정
            this.characterSize = 160;
        } else if (background === 'ocean') {
            this.bgImageSrc = oceanBg;
            this.characterSrc = characterImage; // ocean 배경일 때 캐릭터 설정
            this.characterSize = 120;
        } else if (background === 'home') {
            this.bgImageSrc = homeBg;
            this.characterSrc = zzangGooImage; // home 배경일 때 캐릭터 설정
            this.characterSize = 155;
        } else {
            this.bgImageSrc = bgImage; // default 배경을 bgImage로 설정
            this.characterSrc = characterImage; // 기본 캐릭터 설정
            this.characterSize = 145;
        }
        this.backgroundSelected = true;
    },

    async startGame() {
      await this.setupCamera();
      await this.loadMoveNet();
      this.startCountdown();
    },
    setGameDifficulty() {
      if (this.difficulty === 'easy') {
        this.numBalls = 2 + this.difficultyLevel * 2;
        this.maxLevel = this.difficultyLevel * 2;
      } else if (this.difficulty === 'medium') {
        this.numBalls = 5 + this.difficultyLevel * 2;
        this.maxLevel = this.difficultyLevel * 3;
      } else if (this.difficulty === 'hard') {
        this.numBalls = 8 + this.difficultyLevel * 2;
        this.maxLevel = this.difficultyLevel * 4;
      }
      this.initializeBalls();
    },
    async setupCamera() {
      const video = this.$refs.video;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 }
        });
        video.srcObject = stream;
        return new Promise(resolve => {
          video.onloadedmetadata = () => {
            video.play();
            resolve();
          };
        });
      } catch (error) {
        console.error("카메라 접근 오류:", error);
        alert("카메라에 접근할 수 없습니다. 권한을 확인하거나 HTTPS 환경에서 실행해주세요.");
      }
    },
    async loadMoveNet() {
      await tf.ready();
      const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
      const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
      this.detectPose(detector);
    },
    async detectPose(detector) {
      const video = this.$refs.video;
      const trackingCanvas = this.$refs.trackingCanvas;

      if (!trackingCanvas) {
        console.error("Tracking Canvas가 로드되지 않았습니다.");
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
      this.balls = Array.from({ length: this.numBalls }, () => ({
        x: Math.random() * window.innerWidth,
        y: 0,
        radius: this.characterSize / 2,
        speed: 2 + Math.random() * this.currentLevel,
      }));
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
        this.updateBallsPosition(ctx);
        this.checkCollision();

        if (this.currentLevel < this.maxLevel && this.balls.length === 0) {
          this.advanceLevel();
        }

        requestAnimationFrame(this.gameLoop);
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

        if (ball.y - ball.radius > ctx.canvas.height) {
          this.balls.splice(index, 1);
        } else {
          const ballImg = new Image();
          ballImg.src = this.ballImageSrc;
          ctx.drawImage(ballImg, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
        }
      });
    },
    drawKeypoints(ctx, keypoints) {
      keypoints.forEach(point => {
        if (point.score > 0.5) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
          ctx.fillStyle = 'red';
          ctx.fill();
        }
      });
    },
    drawSkeleton(ctx, keypoints) {
      const adjacentKeyPoints = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
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
      this.balls.forEach(ball => {
        const dx = ball.x - this.characterX - this.characterSize / 2;
        const dy = ball.y - this.characterY - this.characterSize / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ball.radius + this.characterSize / 2) {
          console.log("게임 오버!");
          this.animationRunning = false;
        }
      });
    },
    updateCharacterPosition(keypoints) {
      const leftShoulder = keypoints.find(point => point.name === 'left_shoulder');
      const rightShoulder = keypoints.find(point => point.name === 'right_shoulder');
  
      if (leftShoulder && rightShoulder && leftShoulder.score > 0.5 && rightShoulder.score > 0.5) {
        const userX = (leftShoulder.x + rightShoulder.x) / 2;

        if (this.initialUserX === null) {
          this.initialUserX = userX;
        }

        const deltaX = -(userX - this.initialUserX);
        const maxX = window.innerWidth - this.characterSize;
        const minX = 0;
        const newCharacterX = window.innerWidth / 2 + deltaX;

        this.characterX = Math.min(maxX, Math.max(minX, newCharacterX));
      }
    },
    calculateCalories(keypoints) {
      const leftShoulder = keypoints.find(point => point.name === 'left_shoulder');
      const rightShoulder = keypoints.find(point => point.name === 'right_shoulder');

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
    }
  }
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

video, #trackingCanvas {
  width: 100%;
  height: 100%;
}

video {
  transform: scaleX(-1);
}


.character {
  position: absolute;
}

.countdown, .start-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48px;
  font-weight: bold;
  color: #ff0000;
  text-align: center;
}
</style>
