import { defineStore } from 'pinia'
import debounce from 'lodash.debounce'
import { updatePlayReady } from '@/api/app'


const debouncedUpdatePlayReady = debounce(updatePlayReady, 500)

export const usePlayReadyStore = defineStore('play_ready', {
  state: () => ({
    play_ready: true,
  }),
  getters: {
    currentPlayReady(state) {
        return state.play_ready
    },
  },
  actions: {
    setPlayReady(play_ready) {
      this.play_ready = play_ready
      debouncedUpdatePlayReady(this.play_ready)
    },
  },
})