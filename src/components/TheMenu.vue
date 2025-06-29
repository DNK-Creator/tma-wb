<template>
  <div class="menu">
    <RouterLink to="/home" custom v-slot="{ isActive, navigate }">
      <i
        class="menu-button fa fa-bullseye"
        :class="{ active: isActive }"
        @click="navigate"
        aria-hidden="true"
      ></i>
    </RouterLink>

    <RouterLink to="/friends" custom v-slot="{ isActive, navigate }">
      <i
        class="menu-button fa fa-users"
        :class="{ active: isActive }"
        @click="navigate"
        aria-hidden="true"
      ></i>
    </RouterLink>

    <RouterLink to="/best-referals" custom v-slot="{ isActive, navigate }">
      <i
        class="menu-button fa fa-star"
        :class="{ active: isActive }"
        @click="navigate"
        aria-hidden="true"
      ></i>
    </RouterLink>

    <RouterLink to="/game" custom v-slot="{ isActive, navigate }">
      <i
        class="menu-button fa fa-gamepad"
        :class="{ active: isActive }"
        @click="navigate"
        aria-hidden="true"
      ></i>
    </RouterLink>
  </div>
</template>

<script>
import { RouterLink } from 'vue-router'

export default {
  components: {
    RouterLink
  }
}
</script>

<style scoped>
.menu {
  background: linear-gradient(
	to right bottom,
	rgb(61, 61, 61),
	rgb(54, 54, 54)
  );
  position: absolute;
  align-items: center;
  display: flex;
  bottom: 0;
  left: 0rem;
  right: 0rem;
  justify-content: space-around;
  height: 95px;
  border-radius: 2rem 2rem 0 0;
}

.menu-button {
  font-size: 2rem;
  color: #e1e1e1;
  cursor: pointer;
  transition: color 0.3s;
}

.menu-button.active {
  color: #9356A0; /* or your active color */
}
</style>
