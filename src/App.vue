<template>
  <main class="game-dark" v-if="loaded && userTheme == `dark` ">
    <div class="page">
      <RouterView />
    </div>
  </main>
  <main class="game-light" v-else-if="loaded">
    <div class="page">
      <RouterView />
    </div>
  </main>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { onMounted, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { useTelegram } from '@/services/telegram'


const loaded = ref(false)
const app = useAppStore()
const { tg } = useTelegram()
const urlParams = new URLSearchParams(window.location.search)

const userTheme = ref('')

app.init(urlParams.get('ref')).then(() => {
  loaded.value = true
})

onMounted(async () => {
  setTimeout(() => {
    tg.ready()
    tg.expand()
  }, 1500);
 // userTheme.value = tg.colorScheme
  userTheme.value = 'light'
})

</script>
