<template>
  <div class="home-view">
    <div class="loading-circle" v-if="textActive === false && squirrelActive">
      <img src="../assets/squirrel-idle.gif" alt="Loading..."/>
    </div>
    
    <div class="header-row" v-if="textActive">
      <TopHeader />
      <div class="right-group">
        <img src="../assets/NUT.png" alt="coin"/>
        <span class="score-dark" v-if="userTheme == `light`">{{ scoreStore.score }}</span>
        <span class="score-light" v-else>{{ scoreStore.score }}</span>
      </div>
    </div>

    <!-- Wheel Section -->
    <section class="wheel-section">
    <WheelOfFortune
          v-if="wheelActive"
          ref="wheel"
          :items="items"
          :color-scheme="userTheme"
          :first-item-index="firstItemIndex"
          :centered-indicator="wheelSettings.centeredIndicator"
          :indicator-position="wheelSettings.indicatorPosition"
          :size="wheelSettings.size"
          :display-shadow="wheelSettings.displayShadow"
          :display-border="wheelSettings.displayBorder"
          :display-indicator="wheelSettings.displayIndicator"
          :duration="wheelSettings.duration"
          :result-variation="wheelSettings.resultVariation"
          :easing="wheelSettings.easing"
          :counter-clockwise="wheelSettings.counterClockwise"
          :horizontal-content="wheelSettings.horizontalContent"
          :base-display="wheelSettings.baseDisplay"
          :base-size="wheelSettings.baseSize"
          :base-display-indicator="wheelSettings.baseDisplayIndicator"
          :base-display-shadow="wheelSettings.baseDisplayShadow"
          :base-background="wheelSettings.baseBackground"
          @wheel-start="wheelStartedCallback"
          @wheel-end="wheelEndedCallback"
        >
          <template #baseContent>
            <div
              v-if="wheelSettings.baseHtmlContent"
              v-html="wheelSettings.baseHtmlContent"
            ></div>
          </template>
    </WheelOfFortune>
    </section>
    <!-- Modal Overlay -->
    <transition name="overlay-fade">
      <div v-if="showModal" class="overlay"></div>
    </transition>
    <!-- Modal -->
    <transition name="modal-pop">
      <div v-if="showModal && userTheme == `light`" class="modal-light">
        <button class="close-btn" @click="closeModal">X</button> 
        <!-- X is actually for the button itself -->
        <p v-if="WON === false" href="#">{{ modalMessage }}</p>
        <a v-if="WON === true" v-bind:href=WON_LINK>{{ modalMessage }}</a>
      </div>
      <div v-else-if="showModal" class="modal-dark">
        <button class="close-btn" @click="closeModal">X</button> 
        <!-- X is actually for the button itself -->
        <p v-if="WON === false" href="#">{{ modalMessage }}</p>
        <a v-if="WON === true" v-bind:href=WON_LINK>{{ modalMessage }}</a>
      </div>
    </transition>
    <!-- Tickets left Info -->
    <div class="ticket-info-light" v-if="textActive && userTheme == `light`">
      <h2 v-if="spinsStore.spins > 0">
        Билетов: {{ spinsStore.spins }}
      </h2>
      <h2 v-else>
        Билет через {{ timeUntilNext }} ч
      </h2>
    </div>
    <div class="ticket-info-dark" v-else-if="textActive">
      <h2 v-if="spinsStore.spins > 0">
        Билетов: {{ spinsStore.spins }}
      </h2>
      <h2 v-else>
        Билет через {{ timeUntilNext }} ч
      </h2>
    </div>

    <!-- Action Buttons Section -->
    <div class="hold-button" v-if="spinsStore.spins > 0 && textActive">
      <div class="button" @click="launchWheel">
        <button type="button"> Крутить колесо! </button>
      </div>
    </div>
    <div class="hold-button" v-else-if="textActive">
      <div class="button" @click="buySpin">
        <button type="button">
          <h2>Купить билет - 50</h2>
          <img src="../assets/NUT.png" alt="Coin" class="coin-icon" />
        </button>
      </div>
    </div>
  </div>
  <div class="bottom-anchor"></div>
  <TheMenu />
</template>

<script setup>
import { onMounted, ref, computed, reactive, watch, nextTick } from 'vue'
import { useScoreStore } from '@/stores/score'
import { useSpinsStore } from '@/stores/score'
import { useTimeStore } from '@/stores/timecheck'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { saveWin } from '@/api/app'
import { useTelegram } from '@/services/telegram'
import TheMenu from '@/components/TheMenu.vue'
import TopHeader from '@/components/TopHeader.vue'
import confetti from 'canvas-confetti'
import NutImg from '@/assets/NUT.png'

import WheelOfFortune from '@/components/WheelOfFortune.vue'

const { user } = useTelegram()

const app = useAppStore()

const router = useRouter()

const subscribedToAll = ref(false)

const WON = ref(false)

const WON_LINK = ref('')

const tgStore = useTelegram()

const userTheme = ref('')

const textActive = ref(true)

const squirrelActive = ref(true)

onMounted(async () => {
  // simply let WebKit know we’re listening for touches
  document.body.addEventListener('touchstart', () => {}, { passive: true });
  wheelActive.value = false
  textActive.value = false
  await app.fetchTasks().then(() => {
    if(app.not_done_tasks.every(item => item === true) && app.not_done_tasks.length !== 0) {
      subscribedToAll.value = true
    } 
    else {
      router.push('/tasks')
    }
  })
  await timeStore.loadTimestamp();
 // userTheme.value = tgStore.tg.colorScheme
  userTheme.value = "light"
  wheelActive.value = true
  textActive.value = true
})


const scoreStore = useScoreStore()
const spinsStore = useSpinsStore()
const timeStore = useTimeStore()
const now = ref(Date.now())

setInterval(() => now.value = Date.now(), 60_000)

// 9 hours in ms
//const NINE_HOURS = 9 * 60 * 60 * 1000
//fake
const NINE_HOURS = 60 * 60 * 1000 * 9

// How many ms remain until the next free spin
const msUntilNext = computed(() => {
  const saved = timeStore.timestamp
  if (!saved) return 0
  const then = new Date(saved).getTime()
  const elapsed = now.value - then
  return Math.max(NINE_HOURS - elapsed, 0)
})

// HH:MM display string
const timeUntilNext = computed(() => {
  const ms = msUntilNext.value
  const h  = Math.floor(ms / 3_600_000)
  const m  = Math.floor((ms % 3_600_000) / 60_000)
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
})


async function buySpin() {
  if (isSpinning.value) return
  if (scoreStore.score >= 50) {
    // Spend coins and grant a spin ticket
    scoreStore.spend(50)
    spinsStore.add(1)
    await timeStore.setTimestamp(null)
  } else {
    // Not enough coins: show modal popup
    modalMessage.value = `Билет еще не успел восстановиться 🎀\n`
    + `Не расстраивайся, уже через ${timeUntilNext.value}ч. ты снова сможешь крутить рулетку! \n`
    + `А если хочешь получить очень-очень много билетов, ждем тебя в нашей партнерской программе 🌺`
    showModal.value = true
  }
}

// Template refs
const wheel = ref(null)

// Reactive state
const wheelActive = ref(true)
const firstItemIndex = reactive({ value: 1 })
const wheelSettings = reactive({
  centeredIndicator: true,
  indicatorPosition: 'top',
  size: 43,
  displayShadow: true,
  duration: 4,
  resultVariation: 12,
  easing: 'ease',
  counterClockwise: false,
  horizontalContent: true,
  displayBorder: true,
  displayIndicator: true,
  baseDisplay: true,
  baseSize: 11,
  baseDisplayShadow: true,
  baseDisplayIndicator: false,
  baseBackground: '#5c3e7f',
  baseHtmlContent: '',
})

const items = ref([
  { id: 1, name: 'Lose', htmlContent: `<img src="${NutImg}" alt="Nut" style="max-width:3vh; max-height:3vh;" />`, background: '', weight: 1000, points: 10, opacity: 0.3 },
  { id: 7, name: 'Win_500', htmlContent: '500', background: '', weight: 4, points: 500, opacity: 1 },
  { id: 2, name: 'Lose', htmlContent: `<img src="${NutImg}" alt="Nut" style="max-width:3vh; max-height:3vh;" />`, background: '', weight: 500, points: 15, opacity: 0.3 },
  { id: 9, name: 'Win_500', htmlContent: '500', background: '', weight: 4, points: 500, opacity: 1 },
  { id: 3, name: 'Lose', htmlContent: `<img src="${NutImg}" alt="Nut" style="max-width:3vh; max-height:3vh;" />`, background: '', weight: 500, points: 20, opacity: 0.3 },
  { id: 11, name: 'Win_1000', htmlContent: '1000', background: '', weight: 1, points: 1000, opacity: 1 },
  { id: 4, name: 'Lose', htmlContent: `<img src="${NutImg}" alt="Nut" style="max-width:3vh; max-height:3vh;" />`, background: '', weight: 500, points: 25, opacity: 0.3 },
  { id: 10, name: 'Win_500', htmlContent: '500', background: '', weight: 1, points: 500, opacity: 1 },
  { id: 5, name: 'Lose', htmlContent: `<img src="${NutImg}" alt="Nut" style="max-width:3vh; max-height:3vh;" />`, background: '', weight: 1000, points: 5, opacity: 0.3 },
  { id: 8, name: 'Win_500', htmlContent: '500', background: '', weight: 1, points: 500, opacity: 1 },
  { id: 6, name: 'Lose', htmlContent: `<img src="${NutImg}" alt="Nut" style="max-width:3vh; max-height:3vh;" />`, background: '', weight: 500, points: 50, opacity: 0.3 },
  { id: 12, name: 'Win_2000', htmlContent: '2000', background: '', weight: 1, points: 2000, opacity: 1 },
])

// const items = ref([
//   { id: 1, name: 'Lose', htmlContent: `0`, background: '', weight: 1000, points: 10, opacity: 0.5 },
//   { id: 7, name: 'Win_500', htmlContent: '500', background: '', weight: 2, points: 500, opacity: 1 },
//   { id: 2, name: 'Lose', htmlContent: `0`, background: '', weight: 500, points: 15, opacity: 0.5 },
//   { id: 9, name: 'Win_500', htmlContent: '500', background: '', weight: 2, points: 500, opacity: 1 },
//   { id: 3, name: 'Lose', htmlContent: `0`, background: '', weight: 500, points: 20, opacity: 0.5 },
//   { id: 11, name: 'Win_1000', htmlContent: '1000', background: '', weight: 1, points: 1000, opacity: 1 },
//   { id: 4, name: 'Lose', htmlContent: `0`, background: '', weight: 500, points: 25, opacity: 0.5 },
//   { id: 10, name: 'Win_500', htmlContent: '500', background: '', weight: 1, points: 500, opacity: 1 },
//   { id: 5, name: 'Lose', htmlContent: `0`, background: '', weight: 1000, points: 5, opacity: 0.5 },
//   { id: 8, name: 'Win_500', htmlContent: '500', background: '', weight: 1, points: 500, opacity: 1 },
//   { id: 6, name: 'Lose', htmlContent: `0`, background: '', weight: 500, points: 50, opacity: 0.5 },
//   { id: 12, name: 'Win_2000', htmlContent: '2000', background: '', weight: 1, points: 2000, opacity: 1 },
// ])

const result = ref(null)
const isSpinning = ref(false)
const showModal = ref(false)
const modalMessage = ref('')

// Wheel methods
function wheelStartedCallback() {
  isSpinning.value = true
}
// Utility to format HH:MM
function fmtHM(date = new Date()) {
  const h = String(date.getHours()).padStart(2,'0')
  const m = String(date.getMinutes()).padStart(2,'0')
  return `${h}:${m}`
}

async function wheelEndedCallback(value) {
  isSpinning.value = false
  result.value = value
  if (value.name === 'Lose') { 
    if(spinsStore.spins > 0) {
      modalMessage.value = `Выиграно ${value.points} орешков 💜 \n У тебя еще есть билеты - попробуй снова!`
    }
    else {
      modalMessage.value = `Выиграно ${value.points} орешков 💜 \n Уже через ${timeUntilNext.value}ч. у тебя появится новый билет! \n`
      + `А если хочешь получить очень-очень много билетов, ждем тебя в нашей партнерской программе 🌺`
    }
    scoreStore.add(value.points)
  }
  // Handle wins
  if (/^Win_/.test(value.name)) {
    WON.value=true

    WON_LINK.value = `https://t.me/RealGaro?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%AF%20`
    + `(${app.user.id})%20%D0%B2%D1%8B%D0%B8%D0%B3%D1%80%D0%B0%D0%BB(-%D0%B0)%20%D0%BF%D0%BE%D0%B4%D0%B0%D1%80%D0%BE%D1%87%D0%BD%D1%83%D1%8E%20`
    + `%D0%BA%D0%B0%D1%80%D1%82%D1%83%20%D0%BD%D0%B0%20%D1%81%D1%83%D0%BC%D0%BC%D1%83%20${value.points}`
    + `%20%D1%80%D1%83%D0%B1%D0%BB%D0%B5%D0%B9!`

    modalMessage.value = `ПОЗДРАВЛЯЕМ! \n Подарочная карта на ${value.points} рублей - ТВОЯ! 🌟 \n `
    modalMessage.value += `Чтобы забрать приз, кликни на этот текст и сообщи нам свой Телеграм ID!`

    // 1) Fire a quick burst of confetti
    confetti({
      particleCount: 90,
      spread: 60,
      origin: { y: 0.6 }
    })

    // Extract numeric amount: Win_500 → 500
    const amount = parseInt(value.name.split('_')[1], 10)
    const time = fmtHM()
    try {
      await saveWin({ amount, time })
    } catch (e) {
      console.error('Failed to save win:', e)
    }
  }
  showModal.value = true
}
async function launchWheel() {
  if (isSpinning.value) return 
  if (!wheelActive.value) return
  if (subscribedToAll.value === false) return
  WON.value=false
  spinsStore.spend(1)

  // if now at zero, record this moment:
  if (spinsStore.spins === 0) {
    const nowISO = new Date().toISOString()
    await timeStore.setTimestamp(nowISO)
  }

  wheel.value.launchWheel()
}
function closeModal() {
  showModal.value = false
  onHardReset()
}

function onHardReset() {
  wheelActive.value = false
  textActive.value = false
  result.value = null
  squirrelActive.value = false
  setTimeout(() => (wheelActive.value = true), 10)
  setTimeout(() => (textActive.value = true), 10)
  setTimeout(() => (squirrelActive.value = true), 15)
}

// Watch firstItemIndex to reset
watch(() => firstItemIndex.value, () => {
  wheel.value.reset()
})

</script>


<style scoped lang="scss">

.home-view {
  display: flex;
  flex-direction: column;
  align-items: center;    // horizontal centering
  justify-content: flex-start;
  height: 100vh;
  width: 92vw;
  max-width: 600px;
  margin: 0;
  // padding: 2vh 5vw 12vh;      // relative padding top/bottom & sides
  box-sizing: border-box;
  color: #fff;
  
  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100px;
    width: 100%;
    padding-bottom: 1rem; // optional spacing below header

    .right-group {
      display: flex;
      height: 100%;
      align-items: center;
      object-fit: contain;      // fits without stretching
      gap: 0.75vh;     // space between coin and score
      img {
        width: 3.5vh;           // scales with viewport height
        height: auto;
      }
      span {
        margin-bottom: 0.75vh;
        font-size: 3.5vh;
      }
    }
  }
}



.loading-circle {
  justify-content: center;
  justify-self: center;
  align-self: center;
  align-items: center;
  margin-top: 25vh;
}

.score-light {
  color: #fff;
}

.score-dark {
  font-family: Pusia Bold;
  color: #ffffff;
}

/* Wheel section stays centered */
.wheel-section {
  flex-shrink: 0;         // don’t compress
  margin-bottom: 2.5vh;
  margin-top: -15%;
}

/* Ticket info */
.ticket-info-light {
  user-select: none;
  font-size: 1.5vh;
  font-family: Pusia Bold;
  margin: 8vh 0 0vh;
  text-align: center;
  z-index: 5;
  background-color: rgb(217, 151, 237);
  padding: 2.5vh;
  border-radius: 10px;
}
.ticket-info-dark {
  user-select: none;
  font-size: 1.5vh;
  font-family: Pusia Bold;
  margin: 8vh 0 0vh;
  text-align: center;
  z-index: 5;
  background-color: rgb(148, 111, 159);
  padding: 2.5vh;
  border-radius: 10px;
}

.bottom-anchor {
  margin-top: calc(-30px - 5vh);
}

/* reset the default button chrome */
.button button,
.button a {
  border: none;
  outline: none;
  cursor: pointer;
}

/* Firefox has an inner focus-border on buttons */
.button button::-moz-focus-inner {
  border: 0;
}

.hold-button {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1vh;
}

.button{
  user-select: none;
  cursor: pointer;
  touch-action: manipulation;   
  -webkit-tap-highlight-color: transparent;
  position: relative;  
  display:inline-block;
  z-index: 9;

  h2 {
    font-size: 2vh;
    width: 60vw;
  }
}

.button button,
.button a{
  display: inline-flex;
  justify-content: center;
  align-items: center;
  color:white;
  font-family: Pusia Bold;
  letter-spacing: 2px;
  font-size: 2.75vh;
  text-align: center;
  text-decoration:none;
  background-color:#bf01d4;
  position:relative;
  padding: 3.5vh 5vh;
  
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  text-shadow: 0px 2px 0px #000;
  filter: dropshadow(color=#000, offx=0px, offy=1px);
  
  -webkit-box-shadow:inset 0 1px 0 #f8c4ff, 0 10px 0 #750075;
  -moz-box-shadow:inset 0 1px 0 #f8c4ff, 0 10px 0 #750075;
  box-shadow:inset 0 1px 0 #f8c4ff, 0 10px 0 #750075;
  
  -webkit-border-radius: 1vh;
  -moz-border-radius: 1vh;
  border-radius: 1vh;
}

/* Remove the huge forced width on the H2 */
.button button h2 {
  width: auto;      /* let it size to its content */
  margin: 0;        /* reset any default margins */
  white-space: nowrap;
}

/* Use flex gap to control spacing */
.button button {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;      /* adjust this value to taste */
}

.coin-icon {
  width: 4vh;                /* adjust icon size to match font */
  height: auto;
  display: block;              /* good practice inside flex items */
}

.button a:active,
.button button:active{
  top:10px;
  background-color:#a901bc;
  
  -webkit-box-shadow:inset 0 1px 0 #f8c4ff, inset 0 -3px 0 #750075;
  -moz-box-shadow:inset 0 1px 0 #f8c4ff, inset 0 -3pxpx 0 #750075;
  box-shadow:inset 0 1px 0 #f8c4ff, inset 0 -3px 0 #750075;
}

.header-new {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 10%;
  gap: 5px;
  overflow: auto;
  margin-bottom: -12%;
  padding-top: 20%;
}
.header-new img {
  width: 40px;
  height: 40px;
}

#app {
  font-family: Ubuntu, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 20%;
  position: relative;
}

.buy-spin {
  display: flex;
  align-items: center;
  justify-content: start;
  padding-bottom: 15%;
  overflow: auto;
}

/* Overlay Fade (enter only) */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.65);
  opacity: 1;
  z-index: 10; 
}
.overlay-fade-enter-active {
  transition: opacity 0.3s ease;
}
.overlay-fade-enter-from {
  opacity: 0;
}
.overlay-fade-enter-to {
  opacity: 1;
}
/* No leave transition: instant hide */
.overlay-fade-leave-active {
  transition: none;
}

/* Modal Pop */
.modal-light {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 90vw;
  transform: translate(-50%, -50%) scale(1);
  background: white;
  border-radius: 8px;
  padding-top: 4vh;
  padding-bottom: 4vh;
  padding-left: calc(6vw + 3vh);
  padding-right: calc(6vw + 3vh);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 11;
  white-space: pre-line;
  color: #80287e;
  font-family: Pusia Bold;
  font-size: 2vh;
  text-align: center;
}
.modal-light p {
  white-space: pre-line;
  width: 35vh;
}
.modal-light a {
  white-space: pre-line;
  text-decoration: none;
  color: #80287e;
  width: 35vh;
}

.modal-dark {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 90vw;
  transform: translate(-50%, -50%) scale(1);
  background: rgb(111, 67, 114);
  border-radius: 8px;
  padding-top: 4vh;
  padding-bottom: 4vh;
  padding-left: calc(6vw + 3vh);
  padding-right: calc(6vw + 3vh);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 11;
  white-space: pre-line;
  color: #ffffff;
  font-family: Pusia Bold;
  font-size: 2vh;
  text-align: center;
}

.modal-dark p {
  white-space: pre-line;
  width: 35vh;
}
.modal-dark a {
  white-space: pre-line;
  text-decoration: none;
  color: #80287e;
  width: 35vh;
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
.modal-pop-leave-active {
  transition: none;
}
.modal-pop p {
  color: black;
}

.close-btn {
  position: absolute;
  top: 1vh;
  right: 1vh;
  width: 3vh;
  height: 3vh;
  line-height: 1vh;
  padding: 0;
  font-size: 2.25vh;
  color: #430d42;        // pick a visible color
  background: #965094;     // or transparent with a border
  border: 0.25vh solid #965094;
  border-radius: 25%;
  cursor: pointer;
  z-index: 20;
}
</style>