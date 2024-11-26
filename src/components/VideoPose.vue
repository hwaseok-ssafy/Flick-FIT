<template>
  <div class="container">
    <!-- 로고 -->
    <div class="logo" v-if="!gameOver && !isPaused && !animationRunning">
      <img src="@/assets/fit_logo.png" alt="Flick FIT Logo" />
    </div>

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
    <div v-else :key="'game-start'" class="settings-container">
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
         <button @click="showGameResult">Game Result</button>
       </div>
     </div>

     <div v-if="showPauseMenu" class="pause-menu-overlay">
      <div class="pause-menu">
        <h2>Menu</h2>
        <button @click="togglePause">Continue</button>
        <button @click="changeTheme">select</button>
        <button @click="restartFromStageOne">Restart</button>
        <button @click="exitGame">Exit</button>
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
import { useUserStore } from "@/stores/UserStore";
import axios from 'axios';


export default {
 name: 'VideoPose',
 setup() {
  const userStore = useUserStore();
  userStore.fetchUserData();

  return {
    userStore,
  };
 },
 data() {
   const characterSize = window.innerHeight * 0.12;
   return {
     showCoin: false, // 코인 표시 여부
     coinGif: coinGif, // coinGif를 data에 등록
     coins: 0, // 현재 보유 코인 수
     stageCoins: 0, // 스테이지 클리어로 획득한 코인 수

     isPaused: false, // 일시정지 상태
     showPauseMenu: false, // 일시정지 메뉴 표시 여부
     startTime: null,
     endTime: null,
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
     characterSrc: "",
     initialUserX: null,
     ballImageSrc: ballImage,
     bgImageSrc: bgImage,
     backgroundSelected: false,
     difficultySelected: false,
     selectedMap: 'default',
     caloriesBurned: 0,
     movementDelta: 0, // 1초 동안의 누적 움직임 변화량
    caloriesPerSecond: 0, // 초당 칼로리 소모량
    calorieUpdateInterval: null, // 초당 업데이트 타이머
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

    console.log("startGame 호출됨"); // 디버깅 로그 추가
    this.startTime = new Date().toISOString(); // 게임 시작 시간 설정
    console.log("게임 시작 시간:", this.startTime); // 디버깅 로그
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
   showGameResult() {
    // 게임 결과 화면으로 라우팅
    this.$router.push({ name: "GameResult" });
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

  async endGame(victory) {
    this.animationRunning = false;
    clearInterval(this.stageTimer);
    this.stopCalorieUpdateTimer();
    this.showCoin = false;

    this.gameOver = true;
    // 종료 원인 로그 추가
    if (victory) {
        console.log("게임 클리어! 모든 스테이지 완료!");
        alert('모든 스테이지 완료! 축하합니다!');
    } else {
        console.log("충돌로 게임 종료");
        alert('게임 오버! 버튼을 선택해 재시작하거나 종료하세요.');
    }

    console.log("게임 시작 시간:", this.startTime);

    if (!this.startTime) {
        console.error("startTime이 null 또는 undefined입니다.");
        alert("게임 시작 시간이 누락되었습니다.");
        return;
    }

    this.gameResult = {
        userId: sessionStorage.getItem("user-id"),
        startTime: this.startTime,
        endTime: new Date().toISOString(),
        caloriesBurned: this.caloriesBurned,
        coins: this.coins,
    };

    console.log("게임 결과 데이터 준비 완료:", this.gameResult);
  },

  async showGameResult() {
    if (!this.gameResult) {
        console.error("게임 결과가 없습니다.");
        return;
    }

    const jwtToken = sessionStorage.getItem("access-token");
    if (!jwtToken) {
        alert("인증 토큰이 없습니다. 다시 로그인해주세요.");
        this.$router.push({ name: "Login" });
        return;
    }

    try {
        const response = await axios.post(
            "http://localhost:8080/api-game/game-over",
            this.gameResult,
            {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("게임 결과 저장 성공:", response.data);

        // 결과 화면으로 이동
        this.$router.push({
            name: "GameResult",
            query: {
                gameResult: JSON.stringify(this.gameResult),
            },
        });
    } catch (error) {
        console.error("게임 결과 저장 실패:", error.response || error.message);
        alert("결과 저장에 실패했습니다. 다시 시도해주세요.");
    }
  },


   restartGame() {
    console.log('처음부터 다시 시작 버튼 호출됨');
    this.currentStage = 1; // 스테이지를 1로 초기화
    this.coins = 0; // 코인 초기화 (필요한 경우)
    this.stageCoins = 0; // 스테이지별 코인 초기화
    this.gameOver = false; // 게임 오버 상태 초기화
    this.animationRunning = false; // 애니메이션 초기화
    this.timeRemaining = 20; // 초기 타이머 설정
    clearInterval(this.stageTimer); // 기존 타이머 정리
    this.stageTimer = null; // 타이머 초기화
    this.initializeStage(); // 스테이지 초기화
    this.startCountdown(); // 카운트다운 재시작

    // 칼로리 계산 초기화
    this.caloriesBurned = 0;
    this.caloriesPerSecond = 0;
    this.movementDelta = 0;
    this.lastKeypointPosition = null;

    // 게임 루프 및 스테이지 초기화
    this.initializeStage();
    this.startCountdown();
    this.startCalorieUpdateTimer(); // 칼로리 업데이트 재개
   },
   restartFromCurrentStage() {
    console.log('현재 스테이지 재도전 버튼 호출됨');
    const requiredCoins = this.difficulty === 'easy' ? 1 : this.difficulty === 'normal' ? 2 : 3;

    // 코인 확인
    if (this.coins >= requiredCoins) {
        // 필요한 코인 차감
        this.coins -= requiredCoins;

        // 게임 상태 초기화
        this.gameOver = false;
        this.animationRunning = false;

        // 타이머 초기화
        clearInterval(this.stageTimer);
        this.timeRemaining = 20; // 스테이지 시간 초기화
        this.stageTimer = null;

        // 칼로리 계산 초기화
        this.caloriesBurned = 0;
        this.caloriesPerSecond = 0;
        this.movementDelta = 0;
        this.lastKeypointPosition = null;

        // 스테이지 및 게임 루프 초기화
        this.initializeStage();
        this.startCountdown();
        this.startCalorieUpdateTimer(); // 칼로리 업데이트 재개
    } else {
        // 코인 부족 메시지
        alert(`코인이 부족합니다. 필요한 코인: ${requiredCoins}, 현재 보유 코인: ${this.coins}`);
    }
},
   exitGame() {
     console.log('게임 종료 버튼 호출됨');
     this.animationRunning = false;
     this.gameOver = false;
     this.countdown = null;
     this.difficulty = '';
     this.backgroundSelected = false;
     alert('홈화면으로 돌아갑니다.');
     this.$router.push({ name: "Home" });
   },

   togglePause() {
    if (this.gameOver) return; // 게임 오버 상태에서는 무시

    this.isPaused = !this.isPaused; // 일시정지 상태 토글
    this.showPauseMenu = this.isPaused; // 메뉴 표시 상태 동기화

    if (this.isPaused) {
      this.animationRunning = false; // 애니메이션 중지
      this.pauseStageTimer(); // 타이머 일시정지
      this.stopCalorieUpdateTimer(); // 칼로리 업데이트 정지
    } else {
      this.animationRunning = true; // 애니메이션 재개
      this.startStageTimer(); // 타이머 재개
      this.startCalorieUpdateTimer();
      this.gameLoop(); // 게임 루프 재개
      
    }
  },


    handleKeyDown(event) {
      if (event.key === 'Escape') {
        console.log('ESC 키 눌림'); // 디버깅용 로그
        this.togglePause();
      }
    },



  changeTheme() {
    this.showPauseMenu = false; // 메뉴 닫기
    this.isPaused = false;

    // 브라우저 새로고침을 실행
    window.location.reload();
  },

  restartFromStageOne() {
    this.showPauseMenu = false; // 메뉴 닫기
    this.isPaused = false;
    this.restartGame(); // 스테이지 1로 이동
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
         ctx.fillStyle = 'rgba(255, 0, 0, 0)';
         ctx.fill();
       }
     });
   },
   drawSkeleton(ctx, keypoints) {
     const adjacentKeyPoints = poseDetection.util.getAdjacentPairs(
       poseDetection.SupportedModels.MoveNet
     );
     ctx.strokeStyle = 'rgba(255, 0, 0, 0)';
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

         console.log("충돌로 인해 endGame 호출"); // 확인용 로그
         this.endGame(false); // 충돌 시 게임 종료 호출

       }
     });
   },
   updateCharacterPosition(keypoints) {
    if (this.gameOver) return; // 게임 오버 시 실행 중단
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
  startCalorieUpdateTimer() {
    if (this.calorieUpdateInterval) return; // 이미 타이머가 실행 중이면 중복 실행 방지

    this.calorieUpdateInterval = setInterval(() => {
        if (this.animationRunning && !this.gameOver) { // 게임이 실행 중이고 종료되지 않았을 때만 업데이트
            if (this.caloriesPerSecond > 0) {
                this.caloriesBurned += this.caloriesPerSecond; // 초당 소모량 누적
            }

            // 디버깅: 소모 칼로리 로그
            console.log(`현재까지 소모된 칼로리: ${this.caloriesBurned.toFixed(2)} kcal`);

            // 움직임 변화량 초기화
            this.movementDelta = 0;
        }
    }, 1000); // 매초 업데이트
},
stopCalorieUpdateTimer() {
    if (this.calorieUpdateInterval) {
        clearInterval(this.calorieUpdateInterval);
        this.calorieUpdateInterval = null;
        console.log("칼로리 업데이트 타이머가 정지되었습니다.");
    }
},
  calculateCalories(keypoints) {
    if (this.gameOver) return;

    const userStore = useUserStore();
    const { height, weight, gender } = userStore.signupData;

    if (!weight || !height) {
        console.error("사용자 정보가 누락되었습니다.");
        return;
    }

    // MET 값 설정 (난이도별)
    const MET = this.difficulty === "easy" ? 3.0 : this.difficulty === "normal" ? 6.0 : 8.0;

    // 어깨 키포인트 가져오기
    const leftShoulder = keypoints.find((point) => point.name === "left_shoulder");
    const rightShoulder = keypoints.find((point) => point.name === "right_shoulder");

    if (leftShoulder && rightShoulder && leftShoulder.score > 0.5 && rightShoulder.score > 0.5) {
        const currentPosition = (leftShoulder.y + rightShoulder.y) / 2;

        if (this.lastKeypointPosition !== null) {
            const delta = Math.abs(currentPosition - this.lastKeypointPosition);

            // 움직임 변화량이 일정 임계값 이상일 경우에만 업데이트
            const threshold = 5; // 움직임 감도 (최소 변화량)
            if (delta > threshold) {
                this.movementDelta += delta; // 움직임 누적
            }
        }

        // 초당 소모 칼로리 계산 (1분 단위 환산)
        const caloriesPerMinute = (MET * weight * 3.5) / 200;
        const caloriesPerSecond = caloriesPerMinute / 60;

        this.caloriesPerSecond = caloriesPerSecond * (this.movementDelta / 100); // 움직임 비율 반영
        this.lastKeypointPosition = currentPosition;
    }
},
},

 mounted() {
    this.startCalorieUpdateTimer();
    window.addEventListener('keydown', this.handleKeyDown);
  },
  beforeDestroy() {
    this.stopCalorieUpdateTimer();
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

.logo {
  position: absolute; /* 배경 위에 고정 */
  top: 11%; /* 위쪽 간격 */
  left: 56%; /* 수평 중앙 정렬 */
  transform: translateX(-50%); /* 정확히 가운데로 이동 */
  z-index: 10; /* 다른 요소 위에 표시되도록 우선순위 설정 */
}

.logo img {
  width: 70% ; /* 로고 크기 */
  height: auto; /* 비율 유지 */
}

.settings-container {
 width: 100%;
 height: 100%;
 margin: 0;
 padding: 0;
 display: flex;
 align-items: center;
 justify-content: center;
 background: url('@/assets/home_back.jpg') no-repeat center center; /* 가운데 정렬 */
 background-size: 100% 100%;
}

/* 오버레이 스타일 */
.overlay {
 margin-left: -1%;
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