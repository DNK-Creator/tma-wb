<template>
  <div class="loading-container">
    <div class="loading-logo">
      <img src="../assets/logo1.png"></img>
    </div>
    <Transition name="move">
    <div v-if="doMove" class="loading-bar"></div>
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


onMounted(async () => {
  doMove.value = true
  try {
    await app.fetchTasks().then(() => {
      if(app.not_done_tasks.every(item => item === true) && app.not_done_tasks.length !== 0) {
        setTimeout(() => {
          router.push('/home')
        }, 2400);
      }
      else {
        setTimeout(() => {
          router.push('/tasks')
        }, 2400);
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
  background: radial-gradient(#d45fff, #b028bf);
}

.loading-logo {
  margin-top: 5vh;
  margin-bottom: calc(8vh - 30px);
  /* you already limit via max-height/width below */
  height: 60vw;
  width: 100vw;
  max-height: 480px;
  max-width: 800px;
}

.loading-logo img {
  display: block;
  width: 100%;
  height: 100%;
}

.move-enter-active {
  transition: all 2.8s ease-out;
}

.move-leave-active {
  transition: all 3.4s cubic-bezier(1, 0.5, 0.8, 1);
}

.move-enter-from,
.move-leave-to {
  transform: translateX(-20vh);
}

.loading-bar {
  height: 11.8vh;
  width: 20vh;
  background-image: url('@/assets/squirrel-loading.gif');
  background-size: cover;
  margin-left: calc(11vh + 8vw);
}

.dash {
  width: 33vh;
  border-top: 1px solid purple;
  margin-top: 0.25vh;
  /* flex centering handles horizontal */
}
</style>
