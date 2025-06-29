<template>
    <header class="top-bar">
        <div class="left-group">
          <img
            v-if="user?.photo_url"
            :src="user.photo_url"
            alt="Profile"
            class="profile-pic"
          />
          <div v-else class="profile-placeholder">
            <h1>{{ (user?.first_name ?? 'A').charAt(0) }}</h1>
          </div>
          <h2 class="name">{{user?.first_name ?? "Игрок"}}</h2>
        </div>
    </header>   
</template>


<script setup>
import { computed } from 'vue';
import { useTelegram } from '@/services/telegram';

const { user } = useTelegram()
</script>

<style scoped lang="scss">

.top-bar {
  user-select: none;
  width: 50vw;
  display: flex;
  align-items: center;
  justify-content: center;
  align-content: center;
  gap: 1vh;
  justify-content: space-between;

  .left-group {
    display: flex;
    align-items: center;
  }

  .left-group {
    gap: 0.1rem;  // space between avatar and name
  }

  img {
    width: calc(3.25vh + 3vw);           // scales with viewport height
    height: auto;
  }

  .profile-pic {
    width: calc(7vh + 2vw);
    height: calc(7vh + 2vw);
    border-radius: 50%;
    object-fit: cover;
    margin-right: 0.75rem;
  }

  .profile-placeholder {
    width: calc(7vh + 2vw);
    height: calc(7vh + 2vw);
    border-radius: 30%;
    background-color: var(--accent);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 0.75rem;
  }

  .name {
    color: white;
    font-family: Pusia Bold;
    font-size: calc(2vh + 1vw);
    font-weight: 500;
  }
}

</style>