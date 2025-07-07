<template>
  <div class="text-content2">
    <div class="container">
      <div class="header-row">
        <TopHeader />
        <div class="right-group">
          <button class="button-ref" @click="share">
            <h2 class="ref-text">{{ referalText }}</h2>
          </button>
        </div>
      </div>
      <h1>Топ рефералов!</h1>
      <div class="scrollable">
        <ol>
          <li
            v-for="(ref, index) in bestReferals"
            :key="ref.telegram"
          > 
            <!-- 1. Avatar on the left -->
            <img class="avatar" v-bind:src="getProfilePicture(index)" alt="avatar" />

            <!-- 2. Name flexes to fill the space -->
            <span class="ref-name">{{ ref.first_Name }}</span>

            <!-- 3. Count + right‐side icon grouped together -->
            <div class="count-group">
              <span class="ref-count">
                <img class="people" src="@/assets/PeopleIcon.png">
                <h2>{{ ref.count }}</h2>
              </span>
              <div class="reward-icon">
                <template v-if="index < 10">
                  <img src="@/assets/gift-card.png" alt="reward" />
                  <h3>{{ getRewardIcon(index) }}</h3>
                </template>
                <template v-else>
                  <img class="coin-only" src="@/assets/medal.png" alt="coin" />
                </template>
              </div>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </div>
  <TheMenu />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchReferals } from '@/api/app'
import { useTelegram } from '@/services/telegram'
import TheMenu from '@/components/TheMenu.vue'
import TopHeader from '@/components/TopHeader.vue'
import Crown from '@/assets/Ref_Crown.png'
import Gift  from '@/assets/Ref_Gift.png'
import Silver from '@/assets/Ref_Silver.png'
import Card  from '@/assets/Ref_Card.png'

// Raw referrals data
const referalsList = ref([])

// helper to truncate to 13 chars + “..”
function truncateName(name = '') {
  return name.length > 13
    ? name.slice(0, 13) + '..'
    : name
}

// Load data on mount
onMounted(async () => {
  try {
    // fetch columns: telegram, first_Name, friends
    const data = await fetchReferals()
    referalsList.value = data.map(u => ({
      telegram: u.telegram,
      first_Name: truncateName(u.first_Name),
      count: u.friends ? Object.keys(u.friends).length : 0
    }))
  } catch (err) {
    console.error('Failed to load referrals:', err)
  }
})
// Compute unique, filtered & sorted list
const bestReferals = computed(() => {
  const uniqueMap = new Map()
  for (const u of referalsList.value) {
    if (!uniqueMap.has(u.telegram)) {
      uniqueMap.set(u.telegram, u)
    }
  }
  return Array.from(uniqueMap.values())
    .filter(u => u.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 50)     // ← only take the first 50 items
})

// pick the correct icon by position
function getRewardIcon(index) {
  if (index === 0) return 3000
  if (index === 1) return 2000
  if (index === 2) return 1000
  if (index < 10)  return 500
  return 0
}

function getProfilePicture(index) {
  if (index === 0) return Crown
  if (index === 1) return Gift
  if (index === 2) return Silver
  if (index < 10)  return Card
  return Card
}

// Referral copy
const { user } = useTelegram()
const referalText = ref('Пригласить друга')
const { tg } = useTelegram()

const SHARE_LINK = ref('')
const ADDITION = ref('')
const message = ref('Вращай рулетку в PurpleVibes 💜 Выигрывай подарочные карты для ВБ!')


function share() {
 ADDITION.value = user?.id || "98765231"
 SHARE_LINK.value = 'https://t.me/purplevibebot?start=' + ADDITION.value
 tg.openTelegramLink(`https://t.me/share/url?url=${SHARE_LINK.value}&text=${message.value}`)

}

</script>


<style scoped lang="scss">

.ref-text {
  color: white;
  font-size: 2vh;
}

@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap");

$color-text: #fff;
$color-background: linear-gradient(to right bottom, #f2f0f0, #d4d1d6);
$color-container: linear-gradient(
	to right bottom,
	rgb(240, 142, 250),
	rgb(253, 248, 253)
);
$color-list: rgba(234, 83, 211, 0);


.text-content2 {
	margin: 0;
	height: 100vh;
	display: grid;
	font-size: 1rem;
  justify-content: flex-start;
	//place-items: center;
//	background: $color-background;
	font-family: Rockwell, "Courier New", "Pusia Bold", Courier, Georgia, Times,
		"Times New Roman", serif;
}


.container {
  user-select: none;
  z-index: 0;
  height: 100vh;     
  max-height: 100vh;      // adjust as desired
	width: 100vw;
	padding: 0rem 1rem 1rem 1rem;
	position: relative;
//	background: $color-container;

  overflow: visible;

	&::before {
    z-index: -1;
		content: "";
		top: -10rem;
		left: -10rem;
		width: 40rem;
		height: 40rem;
		position: absolute;
		border-radius: 50%;
		background: rgba(231, 171, 223, 0.35);
	}

	&::after {
    z-index: -1;
		content: "";
    user-select: none;
		bottom: 0rem;
		right: -10rem;
		width: 40rem;
		height: 40rem;
		margin-bottom: -15rem;
		position: absolute;
		border-radius: 50%;
		background: rgba(244, 181, 255, 0.3);
	}

  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100px;
    width: 100%;
    padding-bottom: 1rem; // optional spacing below header
  }

  .right-group {
    float: left;
    display: flex;
    align-items: center;
    gap: 1vh;     // space between coin and score

    .button-ref {
      z-index: 2;
      z-index: 10;
      height: 7vh;
      width: auto;
      padding: 0.5rem 1rem;
      border-radius: 7px;
      background: rgb(152, 57, 169);
      border: none;
    }
  }

	// Heading
	h1 {
      user-select: none;
      top: 0;
      margin: 0;
      padding: 9vh 0 9vh 0vh;
      margin-top: 1vh;
      position: sticky;
      text-align: center;
      color: $color-text;

      margin-bottom: 4vh;
      box-shadow: 0 7px 2rem #d653ea;
      background: rgba(211, 83, 234, 1);
    }
  }

  /* This wraps only your list */
  .scrollable {
  user-select: none;

  position: relative;
  z-index: 5;

  height: calc(90vh - 22.25rem);
  max-height: calc(97vh - 22.25rem);

  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;

  /* hide scrollbars */
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
  scrollbar-width: none;
  scrollbar-color: transparent transparent;
}

.container ol {
  list-style: none;
  counter-reset: my-counter;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;

  li {
    position: relative;     // for our ::before counter
    display: flex;
    height: 70px;
    align-items: center;
    counter-increment: my-counter;
    justify-items: center;

    width: 100%;
    border-radius: 0;
    background: $color-list;

    /* 4. the big number in the bottom left */
    &::before {
      content: '#' counter(my-counter);
      position: absolute;
      font-size: 0.8rem;
      font-weight: bold;
      bottom: 0.15rem;
      left: 3.65rem;            // just under the avatar
      color: rgba(255,255,255, 0.6);
    }

    /* 1. Avatar */
    .avatar {
      width: auto;
      height: 100%;
      object-fit: cover;
      margin-right: 1rem;
      flex-shrink: 0;
      align-self: center;
      justify-self: center;
    }

    /* 2. Name */
    .ref-name {
      flex: 1;               // fill all remaining space
      color: white;
      font-weight: 500;
      font-size: calc(1.5vh + 1vw);
    }

    /* 3. Count + right icon wrapper */
    .count-group {
      display: flex;
      align-items: center;
      position: relative;
      flex-shrink: 0;
    }

    .ref-count {
      display: grid;
      /* 1fr for the icon, fixed 4ch for the text “slot” */
      grid-template-columns: auto 4ch;
      column-gap: 0.25rem;     // space between icon & text
      align-items: center;
      height: 2rem;
      padding: 0 0.2rem;       // keep some breathing room on the sides
      border-radius: 1rem;
      margin-right: 0rem;
      flex-shrink: 0;

      .people {
      grid-column: 1;          // always in the first column
      width: 1.6rem;
      height: 1.35rem;
      opacity: 0.85;
      justify-self: start;     // stick icon to the left edge of its cell
      }
       h2 {
        color: white;
        opacity: 0.8;
        grid-column: 2;          // always in the second column
        margin: 0;
        font-weight: bold;
        font-family:
          'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 1rem;
        line-height: 1;          
        text-align: center;      // center numbers in that 4ch-wide slot
        justify-self: center;    
        overflow: hidden;        // if >4 digits, clip/ellipsis if you like
        text-overflow: ellipsis; 
        white-space: nowrap;
      }
    }

    .reward-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 5rem;
      height: 2rem;
      margin-left: 0.5rem;
      flex-shrink: 0;
      margin-right: 1rem;
      background-color: #d379e7;
      border-radius: 12px;
      justify-content: center;
    }
        /* top-10 layout: gift icon + text */
    .reward-icon img {
      opacity: 20%;
      height: 70%;
      width: 32%;
      margin-right: 0.25rem;
    }
    .reward-icon h3 {
      font-family: 'Courier New', Courier, monospace;
      color: rgb(157, 64, 191);
      margin: 0;
    }

    /* >10 layout: override image sizing so the coin fills/centers nicely */
    .reward-icon .coin-only {
      opacity: 1;
      width: auto;
      opacity: 0.65;
      height: 1.8rem;    /* adjust as needed to look good */
      /* no margin, since we want it centered in that flex box */
    }
  }
}

</style>