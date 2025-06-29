<template>
  <div class="text-content">
    <h1>Чтобы пользоваться приложением бесплатно, подпишитесь на наших прекрасных спонсоров 🔮 </h1>
    <h3 v-if="subscribedToAll">Вы на всех подписанны..!</h3>
    <ul class="list" v-if="!subscribedToAll">
      <li class="list2-item" v-for="task in app.tasks" :key="task.id" @click.prevent="openTask(task)">
        {{ task.title }}
      </li>
    </ul>
    <footer>
      <div class="center">
        <button class="button-ref" @click="checkManually">
          <h2 class="ref-text">{{ checkText }}</h2>
        </button>
      </div>
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
  }, 5000);
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
.list2-item {
  background: #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.text-content {
  text-align: center;
  text-justify: center;
  h1 {
    color: rgb(167, 125, 168);
    font-family: Pusia Bold;
    margin: 5vh;
    margin-top: -20vh;
  }

  .list {
    align-content: center;
    justify-content: center;
    .list2-item {
      align-self: center;
      justify-self: center;
      width: 90%;
    }
  }

  .center {
    .button-ref {
      background-color: purple;
      padding: 15px;
      border-radius: 5px;
      border: none;
      .ref-text {
        color: white;
      }
    }
  }
}
</style>