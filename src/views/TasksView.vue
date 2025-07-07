<template>
  <div class="text-content">
    <h1>Чтобы пользоваться приложением бесплатно, подпишись на наших чудесных спонсоров:</h1>

    <h3 v-if="subscribedToAll" class="subscribed-ok">Вы на всех подписанны..!</h3>

    <ul v-else class="list">
      <li
        v-for="task in app.tasks"
        :key="task.id"
        class="list-item"
        @click.prevent="openTask(task)"
      >
        {{ task.title }}
        <span class="external-icon">↗︎</span>
      </li>
    </ul>

    <footer>
      <button class="check-button" @click="checkManually">
        {{ checkText }}
      </button>
    </footer>
  </div>
</template>

<script setup>
import { useTelegram } from '@/services/telegram'
import { useAppStore } from '@/stores/app'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const { tg } = useTelegram()

const app = useAppStore()

const delayBetweenChecks = ref(null)

const subscribedToAll = ref(false)

const checkText = ref('')

onMounted(async () => {
  app.fetchTasks()
  checkText.value = "Проверить подписки"
})

async function checkManually() {
  if (delayBetweenChecks.value === true) return
  checkText.value = "Проверяем.."
  delayBetweenChecks.value = true
  await app.fetchTasks().then(() => {
    if(app.not_done_tasks.every(item => item === true) && app.not_done_tasks.length !== 0) {
      subscribedToAll.value = true
      router.push('/home')
    }
    else {
      checkText.value = "Проверить подписки"
    }
  })
  setTimeout(function () {
    delayBetweenChecks.value = false
  }, 4000);
}

function openTask(task) {
  if (task.url.includes('t.me')) {
    tg.openTelegramLink(task.url)
  } else {
    tg.openLink(task.url)
  }
}
</script>


<style scoped lang="scss">
.text-content {
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 5vw;
  min-height: 100vh;
  background-image: url("@/assets/background-new.png");
}

h1 {
  user-select: none;
  margin-top: 32vh;
  margin-bottom: 4vh;
  font-size: 3vh;
  font-weight: normal;
  line-height: 1.3;
  color: #ffffff;
  color: #fff;
  text-shadow: #000 2px 2px 5px;
  -webkit-font-smoothing: antialiased;
  font-family: Pusia Bold;
}

/* Success message */
.subscribed-ok {
  user-select: none;
  margin-bottom: auto;
  font-size: 2.2vh;
  color: #444;
}

/* List of sponsor buttons */
.list {
  user-select: none;
  width: 100%;
  max-width: 400px;
  margin-bottom: auto; /* push footer to bottom */
  list-style: none;
  padding: 0;
  height: 30vh;
  align-items: center;
  justify-items: center;
}

.list-item {
  user-select: none;
  position: relative;
  background: rgb(116, 55, 126, 0.8);
  border: 1.5px solid rgb(102, 48, 110);
  border-radius: 12px;
  padding: 1rem;
  width: 75%;
  margin-bottom: 1rem;
  font-size: 2.5vh;
  color: #ffffff;
  font-family: Pusia Bold;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.list-item .external-icon {
  user-select: none;
  margin-left: 0.5em;
  font-size: 1.2em;
  color: #ffffff;
}

/* Footer “Проверить подписку” button */
footer {
  width: 100%;
  padding: 2vh 0;
  background: transparent;
}

.check-button {
  user-select: none;
  width: 95%;
  max-width: 400px;
  height: 10vh;
  background-color: #74377e;
  border: 2.5px solid #ffffff;
  color: #ffffff;
  font-size: 2.5vh;
  font-weight: 600;
  border-radius: 16px;
  margin-bottom: 7vh;
  cursor: pointer;
}
</style>