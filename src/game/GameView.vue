<template>
    <!-- WIN MODAL -->
    <transition name="overlay-fade">
      <div v-if="showWinModal" class="overlay"></div>
    </transition>
    <transition name="modal-pop">
      <div v-if="showWinModal" class="modal">
        <button class="close-btn" @click="restartGame">✕</button>
        <p v-if="!WON">Поздравляем! Вы собрали {{ rewardScore }} монеток!</p>
        <p v-if="!WON && rareScore > 0"> А также {{rareScore}} билет(-а)! </p>
      </div>
    </transition>

    <!-- LOSE MODAL -->
    <transition name="overlay-fade">
      <div v-if="showLoseModal" class="overlay"></div>
    </transition>
    <transition name="modal-pop">

    <div v-if="showLoseModal" class="modal">
      <button class="close-btn" @click="restartGame">✕</button>
      <p>Спасибо, что сыграли!</p>
      <p v-if="rewardScore > 0">Монеток: {{ rewardScore }}</p>
      <p v-if="rareScore > 0">Билетов: {{ rareScore }}</p>
      <h2 v-if="rewardScore <= 0 && rareScore <= 0">Не расстраивайся, тебе точно повезет в следующий раз! 🐿️ </h2>
    </div>
  </transition>
  <div class="header-row-game">
      <TopHeader />
  </div>
  <!-- START SCREEN -->
  <div v-if="playReadyStore.play_ready == false" class="start-screen">
      <h2 v-if="!started && !showLoseModal && !showWinModal">
          До следующей попытки {{ timeUntilNext }}ч.
      </h2>
  </div>
  <div v-else
      class="start-screen"
      data-start-screen
  >
      <h2 v-if="!started && !showLoseModal && !showWinModal">
          Нажмите играть, чтобы начать
      </h2>
  </div>
  
  <!-- SCORE DISPLAY -->
  <div
      class="score"
      v-show="started && !showLoseModal && !showWinModal"
  >
      <div data-simple-score>Монеток: {{ rewardScore }}</div>
      <div data-rare-score>Билетов: {{ rareScore }}</div>
  </div>

  <div class="main-game">
    <div class="world" data-world>

        <img
        src="../assets/Game/ground.png"
        class="ground"
        data-ground
        />
        <img
        src="../assets/Game/ground.png"
        class="ground"
        data-ground
        />
        <img
        src="../assets/Game/RUN_1.png"
        alt="Dino"
        class="dino"
        data-dino
        />

    </div>
    <div class="below-ground"></div>
  </div>
  <button
    class="action-button"
    @click="handleAction"
    v-if="!showLoseModal && !showWinModal && (playReadyStore.play_ready == true || started)"
    >
    {{ buttonLabel }}
  </button>
  <TheMenu />
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import TheMenu from '@/components/TheMenu.vue'
import TopHeader from '@/components/TopHeader.vue'
import { startGame, jump, setPixelToWorldScale, initUIRefs, resetDefault } from '@/game/script.js'
import { useScoreStore } from '@/stores/score'
import { useSpinsStore } from '@/stores/score'
import { usePlayTimeStore } from '@/stores/timecheck'
import { usePlayReadyStore } from '@/stores/playStore'

const started = ref(false)

const buttonLabel = computed(() => (started.value ? 'Прыжок' : 'Играть'))

const rewardScore  = ref(0)
const rareScore    = ref(0)

const showWinModal = ref(false)
const showLoseModal= ref(false)

const scoreStore = useScoreStore()
const spinsStore = useSpinsStore()
const timeStore = usePlayTimeStore()
const playReadyStore = usePlayReadyStore()

const now = ref(Date.now())

setInterval(() => now.value = Date.now(), 60_000)

const TWENTY_FOUR_HOURS = 60*60*1000*24

async function handleAction() {
  if (!started.value && playReadyStore.currentPlayReady === true) {
    startGame()
    started.value = true
    const nowISO = new Date().toISOString()
    await timeStore.setPlayTimestamp(nowISO)
    playReadyStore.setPlayReady(false)
  } else {
    jump()
  }
}

// restart both win/lose
function restartGame() {
  showWinModal.value  = false
  showLoseModal.value = false
  started.value = false
  rewardScore.value = 0
  rareScore.value = 0
  startGame()
}

// event listeners
function onGameWin(e) {
    showWinModal.value = true
    rewardScore.value = e.detail.rewardScore
    rareScore.value   = e.detail.rareScore
    if(rewardScore.value > 0) {
        scoreStore.add(rewardScore.value)
    }
    if(rareScore.value > 0) {
        spinsStore.add(rareScore.value)
    }
}
function onGameLose(e) {
  // pick up the final scores from event.detail
  rewardScore.value = e.detail.rewardScore
  rareScore.value   = e.detail.rareScore
  showLoseModal.value = true
  if(rewardScore.value > 0) {
    scoreStore.add(rewardScore.value)
  }
  if(rareScore.value > 0) {
    spinsStore.add(rareScore.value)
  }
}

// How many ms remain until the next free spin
const msUntilNext = computed(() => {
  const saved = timeStore.play_timestamp
  if (!saved) return 0
  const then = new Date(saved).getTime()
  const elapsed = now.value - then
  return Math.max(TWENTY_FOUR_HOURS - elapsed, 0)
})

// HH:MM display string
const timeUntilNext = computed(() => {
  const ms = msUntilNext.value
  const h  = Math.floor(ms / 3_600_000)
  const m  = Math.floor((ms % 3_600_000) / 60_000)
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
})

// When the countdown reaches zero, auto‑grant a spin if they have none
watch(
  () => msUntilNext.value,
  async (ms) => {
    // 2) A single `if` with braces to guard everything
    if (
      ms === 0
      // timeStore.play_timestamp   // only if there was a countdown running
    ) {
      playReadyStore.setPlayReady(true)
      await timeStore.setPlayTimestamp(null)
    }
  },
  {
    immediate: true,   // run right away on mount
    flush: "post",     // ensure it runs after DOM updates (optional)
  }
)

onMounted(async () => {
    resetDefault()
    setPixelToWorldScale()
    initUIRefs()
    window.addEventListener('resize', setPixelToWorldScale)
    window.addEventListener('game-win',  onGameWin)
    window.addEventListener('game-lose', onGameLose)
    await timeStore.loadPlayTimestamp();
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', setPixelToWorldScale)
  window.removeEventListener('game-win',  onGameWin)
  window.removeEventListener('game-lose', onGameLose)
})

</script>

<style lang="scss">

.header-row-game {
  margin-left: 6.5vw;
  margin-top: 1vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100px;
  width: 100%;
  padding-bottom: 1rem; // optional spacing below header

  .right-group {
    display: flex;
    align-items: center;
    gap: 1vh;     // space between coin and score
    img {
      width: calc(3.25vh + 3vw);           // scales with viewport height
      height: auto;
    }
    span {
      font-size: 4vh;
    }
  }
}

.main-game {
  position: relative;
  margin-top: 25vh;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  display: grid;
  align-items: start;     /* ← change this */
  justify-items: center;   /* still center horizontally */
}


.world {
  overflow: visible;
  position: relative;
  z-index: 2;
}

.score {
  user-select: none;
  width: 80vw;
  height: 20vh;
  font-family: Pusia Bold;
  color: white;
  position: absolute;
  font-size: 4vmin;
  opacity: 0.4;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.start-screen {
  user-select: none;
  width: 80vw;
  height: 15vh;
  font-family: Pusia Bold;
  color: white;
  position: absolute;
  font-size: 4vmin;
  opacity: 0.5;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.hide {
  display: none;
}

.ground {
  --left: 0;
  position: absolute;
  width: 300%;
  bottom: calc(-1.2vh - 0.25vw);
  left: calc(var(--left) * 1%)
}

.dino {
  --bottom: 0;
  position: absolute;
  left: 5%;
  height: 24%;
  bottom: calc(var(--bottom) * 1%);
}

.cactus {
  position: absolute;
  left: calc(var(--left) * 1%);
  height: 16%;
  bottom: 0;
}

/* Floating reward images */
.reward {
  position: absolute;
  left: calc(var(--left) * 1%);
  /* this line is critical: */
  bottom: calc(var(--bottom) * 1%);
  width: 5vmin;
  pointer-events: none;
  will-change: transform, bottom, left;
}

.below-ground {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgb(196,61,45);
  z-index: 0;
  /* remove width/height/top from here */
}

.action-button {
  position: fixed;
  bottom: calc(16vh + 0.5vw);
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  
  font-size: 2.5vh;
  font-family: Pusia Bold;
  padding: 1.25rem 2.5rem;
  border-radius: 0.5rem;
  background: #bf01d4;
  
  color: #fff;
  border: none;

  /* add smooth transitions for transform and shadow */
  transition: transform 0.1s ease-out, box-shadow 0.1s ease-out;
}

/* when the user clicks / holds the button down */
.action-button:active {
  /* slightly scale down and drop shadow to give “pressed” look */
  transform: translateX(-50%) scale(0.95);
  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.18);
}

.overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.65);
  z-index: 100;
}
.overlay-fade-enter-active {
  transition: opacity 0.3s ease;
}
.overlay-fade-enter-from { opacity: 0; }
.overlay-fade-enter-to   { opacity: 1; }

/* no leave transition: instant hide */
.overlay-fade-leave-active { transition: none; }

.modal {
  position: fixed;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%) scale(1);
  background: white;
  border-radius: 8px;
  padding: 4vh calc(6vw + 3vh);
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  z-index: 101;
  color: #80287e;
  font-family: Pusia Bold;
  font-size: 2vh;
  text-align: center;
  white-space: pre-line;
}

.modal p,
.modal a {
  display: block;
  font-size: 3vh;
  margin: 1vh 0;
  width: 35vh;
  text-decoration: none;
  color: #80287e;
}

.modal h2 {
  display: block;
  font-size: 1.8vh;
  margin: 1vh 0;
  width: 35vh;
  text-decoration: none;
  color: #80287e;
}

.modal-pop-enter-active {
  transition: transform 0.3s ease;
}
.modal-pop-enter-from {
  transform: translate(-50%, -50%) scale(0);
}
.modal-pop-enter-to {
  transform: translate(-50%, -50%) scale(1);
}
/* no leave animation */
.modal-pop-leave-active { transition: none; }

/* close “X” button */
.close-btn {
  position: absolute;
  top: 1vh; right: 1vh;
  width: 3vh; height: 3vh;
  line-height: 1vh;
  font-size: 2.25vh;
  background: #a35fa2;
  color: #80287e;
  border: 0.25vh solid #a35fa2;
  border-radius: 25%;
  cursor: pointer;
  z-index: 102;
}
</style>