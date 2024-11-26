<template>
  <div id="app" @keydown="handleKeydown" tabindex="0">
    <!-- BGM 제어 버튼 -->
    <button @click="toggleBGM" class="bgm-button">
      {{ bgmPlaying ? "🔊 BGM 끄기" : "🔈 BGM 켜기" }}
    </button>
    <!-- 라우터 출력 -->
    <router-view />
  </div>
</template>

<script>
import bgmAudio from "@/assets/bgm.mp3";

export default {
  data() {
    return {
      bgm: null, // BGM 오디오 객체
      bgmPlaying: false, // 현재 BGM 재생 상태
      bgmStarted: false, // 키로 BGM이 시작되었는지 여부
    };
  },
  methods: {
    handleKeydown(event) {
      // L 또는 S 키로 BGM 시작
      if (!this.bgmStarted && (event.key.toLowerCase() === "l" || event.key.toLowerCase() === "s")) {
        this.startBGM();
      }
    },
    startBGM() {
      if (!this.bgm) {
        this.bgm = new Audio(bgmAudio);
        this.bgm.loop = true; // 반복 재생
        this.bgm.volume = 0.5; // 기본 볼륨
      }
      if (!this.bgmPlaying) {
        this.bgm
          .play()
          .then(() => {
            console.log("BGM started!");
            this.bgmPlaying = true;
            this.bgmStarted = true;
          })
          .catch((error) => {
            console.error("BGM play failed:", error);
          });
      }
    },
    toggleBGM() {
      if (this.bgmPlaying) {
        // BGM 끄기
        this.bgm.pause();
        this.bgmPlaying = false;
      } else {
        // BGM 켜기
        this.startBGM();
      }
    },
  },
  mounted() {
    this.$el.focus(); // 키 입력 이벤트 활성화
  },
};
</script>
<style>
/* 글로벌 스타일 */
#app {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  height: 100vh;
  background-color: #f5f5f5;
}

.bgm-button {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
  padding: 10px 20px;
  font-size: 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.bgm-button:hover {
  background-color: #218838;
}
</style>
