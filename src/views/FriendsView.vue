<template>
  <div class="app-container">

    <!-- Main Content -->
    <main class="content">
      <!-- Rewards Section -->
      <section class="rewards-section">
      <div class="rewards-img">
        <img src="@/assets/squirrel-idle.gif">
      </div>
      <h2 class="rewards-header">ПРИГЛАШАЙ ДРУЗЕЙ И ПОЛУЧАЙ БИЛЕТЫ!</h2>
      <!-- NEW WRAPPER -->
      <div class="button-group">
        <div class="button-ref" @click="copy">
          <h2 class="link-base"> {{referalText}} </h2>
        </div>
        <div class="button-share" @click="share">
          <img src="@/assets/UPLOAD_ICON.png">
        </div>
      </div>
      </section>

      <!-- Invites Section -->
      <section class="invites-section">
        <h3 v-if="friends.length !== 0" class="invites-header-notempty">Приглашенные друзья: {{ friends.length }}</h3>
        <h3 v-else class="invites-header-empty">Скорее зовите друзей, вместе веселее!</h3>
        <div class="friends-list">
          <div
            v-for="(friend, idx) in friends"
            :key="idx"
            class="friend-item"
          >
            <div class="avatar">{{ friend.initial }}</div>
            <div class="friend-info">
              <p class="friend-name">{{ friend.name || friend.telegram }}</p>
              <p v-if="friend.tag" class="badge">{{ friend.tag }}</p>
            </div>
            <div class="points">+{{ friend.points }}</div>
          </div>
        </div>
        <div class="instruction-container">
          <h2>1. ТОП-10 рефералов гарантированно получают подарочные карты. </h2>
          <h3>2. ТОП-50 рефералов участвуют в розыгрыше карты на 10.000 рублей!</h3>
        </div>
      </section>
    </main>
  </div>
  <!-- Menu Component -->
  <TheMenu />
</template>

<script setup>
import { useTelegram } from '@/services/telegram'
import { useAppStore } from '@/stores/app'
import { ref, computed } from 'vue'
import TheMenu from '@/components/TheMenu.vue'

const app = useAppStore()
const { user } = useTelegram()
const { tg } = useTelegram()

const SHARE_LINK = ref('')
const ADDITION = ref('')
const message = ref('Вращай рулетку в PurpleVibes 💜 Выигрывай подарочные карты для ВБ!')

// Referral copy logic
const referalText = ref('Копировать ссылку 🔗')
function copy() {
  ADDITION.value = user?.id || "98765231"
  navigator.clipboard.writeText(
    'https://t.me/purplevibebot?start=' + ADDITION.value
  )
  referalText.value = 'Скопировано!'
  setTimeout(() => {
    referalText.value = 'Копировать ссылку 🔗'
  }, 1700);
}

function share() {
  ADDITION.value = user?.id || "98765231"
  SHARE_LINK.value = 'https://t.me/purplevibebot?start=' + ADDITION.value
  tg.openTelegramLink(`https://t.me/share/url?url=${SHARE_LINK.value}&text=${message.value}`)
}

// Build friends list from store
const friends = computed(() =>
  Object.keys(app.user.friends).map((id) => {
    const name = app.user.friends[id]
    return {
      id,
      name,
      telegram: null,
      initial: name.charAt(0).toUpperCase(),
      tag: id === '1' ? 'W/0/24' : null,
      points: 1
    }
  })
)
</script>

<style lang="scss" scoped>
// Core variables
$primary: rgb(139, 31, 158);
$accent: rgb(171, 150, 168);
$text-primary: #FFFFFF;
$text-secondary: rgba(255, 255, 255, 0.65);
$divider: rgba(219, 111, 220, 0.05);

.app-container {
  color: $text-primary;
  margin: 0 auto;
  position: relative;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 1.5vh;
  padding-bottom: 100px; // room for menu
  overflow-y: auto;
  flex: 1;
}

.rewards-section {
  user-select: none;
  position: relative;
  justify-self: center;
  padding: 0vh;
  text-align: center;
  background: rgba(211, 83, 234, 0.7);
//  width: 92vw;
  width: 96%;  
  max-width: 460px;
  height: calc(27vh + 5vw);
  border-radius: 20px;
  justify-content: center;

  box-shadow: 0 7px 2rem #d653ea;

  .rewards-img {
    justify-self: center;
    align-self: flex-start;
    justify-content: center;
    align-content: center;
    margin-right: 10px;
    width: calc(13vh + 4vw);
    height: calc(13vh + 4vw);
    max-height: 100px;
    max-width: 100px;
    img {
      height: 80%;
      width: 80%;
    }
  }

  .rewards-header {
    text-align: center;
    text-justify: center;
    margin-left: auto;
    margin-right: auto;
    font-family: Pusia Bold;
    font-size: 2.5vh;
    font-weight: 700;
    text-transform: uppercase;
  }

  .rewards-subheader {
    font-size: 14px;
    opacity: 0.7;
    margin-top: 8px;
  }

  .reward-value {
    font-size: 64px;
    font-weight: 800;
    margin: 16px 0;
  }
}

.invites-section {
  padding: 20px;
  user-select: none;

  .invites-header-notempty {
    font-family: Pusia Bold;
    font-size: calc(2.6vh + 1vw);
    opacity: 0.7;
    margin-bottom: 8px;
  }

  .invites-header-empty {
    font-family: Pusia Bold;
    text-align: center;
    font-size: calc(2.6vh + 1vw);
    opacity: 0.7;
    margin-bottom: 8px;
  }

  .friends-list {
    height: 21vh;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
    scrollbar-width: none;
    scrollbar-color: transparent transparent;

    .friend-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid $divider;

      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: $primary;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        margin-right: 16px;
      }

      .friend-info {
        flex: 1;

        .friend-name {
          font-size: 16px;
          font-weight: 500;
        }

        .badge {
          font-size: 12px;
          opacity: 0.7;
          margin-top: 4px;
        }
      }

      .points {
        margin-right: 20px;
        font-size: 16px;
        font-weight: 700;
        color: $accent;
      }
    }
  }

  .instruction-container {
    margin-top: 2.5vh;
    margin-left: auto;
    margin-right: auto;
    padding: 0;
    background:rgba(141, 63, 141, 0.8);
    height: 16.5vh;
    width: 76vw;
    max-width: 900px;
    border-radius: 15px;
    text-align: start;
    margin-bottom: auto;
    align-content: center;

    h2 {
      margin-top: -0.5vh;
      margin-left: 3vw;
      font-family: Pusia Bold;
      font-size: calc(1.8vh + 0.25vw);
      color: rgba(255, 255, 255, 0.95);
    }
    h3 {
      margin-top: 1vh;
      margin-left: 3vw;
      margin-bottom: 0;
      font-family: Pusia Bold;
      font-size: calc(1.8vh + 0.25vw);
      color: rgba(255, 255, 255, 0.95);
    }
  }
}

.button-ref,
.button-share {
  background: rgb(152, 57, 169);
  color: $text-primary;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  /* remove the horizontal auto-margins */
  margin: 0;
}

.button-ref {
  width: 55vw;
  max-width: 260px;
  height: 8vh;

  h2 {
    color: rgba(255, 255, 255, 0.85);
    font-family: Pusia Bold;
    font-size: 100%;
    margin: 0;
  }
}

.button-share {
  width: 20vw;
  max-width: 80px;
  height: 8vh;
  border-radius: 25px;
  padding: 10px;

  img {
    opacity: 0.85;
    /* reset your tiny top margin */
    margin-top: 0;
    height: calc(2.5vh + 1vw);
    width: calc(2.5vh + 1vw);
  }
}

.button-group {
  display: flex;
  justify-content: center;
  align-items: center;  // aligns both buttons on the same vertical center
  gap: 1vw;             // horizontal space between them
  margin: 0.5rem auto;  // centers the group and gives top/bottom breathing room
}

// .button-ref { 
//   float: left;
//   width: 55vw;
//   max-width: 260px;
//   height: 8vh;
//   background: rgb(152, 57, 169);
//   color: $text-primary;
//   border: none;
//   border-radius: 15px;
//   //padding: calc(0.7vw + 0.7vh);
//   cursor: pointer;
//   align-content: center;

//   margin-left: 10%;
//   margin-top: 0.5rem;

//   h2 {
//     color: rgba(255, 255, 255, 0.85);
//     font-family: Pusia Bold;
//     font-size: 100%;
//   }
// }

// .button-share { 
//   //float: left;
//   width: 20vw;
//   max-width: 80px;
//   height: 8vh;
//   margin-left: 1.5%;
//   margin-top: 0.5rem;
//   background: rgb(152, 57, 169);
//   color: $text-primary;
//   border: none;
//   border-radius: 35px;
//   padding: 10px;
//   cursor: pointer;
//   align-content: center;

//   img {
//     opacity: 0.85;
//     margin-top: 1px;
//     height: calc(2.5vh + 1vw);
//     width: calc(2.5vh + 1vw);
//   }
// }

</style>