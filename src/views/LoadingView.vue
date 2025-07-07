<template>
  <div class="loading-container">
    <div class="message">{{ message }}</div>
    <Transition name="move">
      <!-- replace your div with an <img> -->
      <img
        v-if="doMove"
        class="loading-bar"
        src="@/assets/RUN_GIF.gif"
        alt="Running animation"
      />
    </Transition>
    <div class="dash"></div>
  </div>
</template>

<script setup>
import { onMounted, ref }   from 'vue'
import { useAppStore } from '@/stores/app'
import { useRouter }   from 'vue-router'

const app    = useAppStore()
const router = useRouter()
const doMove = ref(false)

const message = ref('')

// your phrases; feel free to add more
const phrases = [
  'Сегодня чудесный день',
  'Я знаю, что тебе повезет',
  'Сегодня ты шикарно выглядишь',
  'Главное - вера',
  'Твой вишлист на ВБ идеален!',
  'Удача на твоей стороне',
  'Не забудь сыграть в мини-игру!',
  /* …you’ll fill these in later… */
]

onMounted(async () => {
  // pick a random message
  message.value = phrases[Math.floor(Math.random() * phrases.length)]

  doMove.value = true
  try {
    await app.fetchTasks().then(() => {
      if(app.not_done_tasks.every(item => item === true) && app.not_done_tasks.length !== 0) {
        setTimeout(() => {
          router.push('/home')
        }, 1700);
      }
      else {
        setTimeout(() => {
          router.push('/tasks')
        }, 1700);
      }
    })
  } catch (err) {
    console.error('Initialization failed:', err)
    router.replace('/tasks')
  }
})
</script>

<style scoped lang="scss">
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;      // horizontal centering
  justify-content: center;  // vertical centering
  height: 100%;
  width: 100%;
  background-image: url("@/assets/background-new.png");
  background-size: auto;
  background-repeat: repeat;
}

.message {
  /* full width of container */
  width: 90%;
  text-align: center;

  /* your style requirements */
  color: #fff;
  font-family: 'Pusia Bold', sans-serif;
  font-size: 3vh;
  opacity: 0.6;

  margin-top: 25vh;
}

.loading-logo {
  margin-top: 2vh;
  margin-bottom: calc(10vh - 30px);
  /* you already limit via max-height/width below */
  height: 70vw;
  width: 100vw;
  max-height: 340px;
  max-width: 550px;
}

.loading-logo img {
  display: block;
  width: 100%;
  height: 90%;
}

.move-enter-active {
  transition: all 2.5s ease-out;
}

.move-leave-active {
  transition: all 3.1s cubic-bezier(1, 0.5, 0.8, 1);
}

.move-enter-from,
.move-leave-to {
  transform: translateX(-25vh);
}

.loading-bar {
  display: block;
  margin-top: 20vh;
  height: 13vh;
  width: 250vh;
  object-fit: contain;   /* preserve aspect ratio & show whole GIF */
  margin-left: calc(11vh + 8vw);
}

.dash {
  width: 33vh;
  border-top: 4px solid rgb(132, 64, 159);
  margin-top: 0vh;
  border-radius: 5px;
  /* flex centering handles horizontal */
}
</style>
