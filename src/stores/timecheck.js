import { getLastTime } from "@/api/app"
import { getPlayLastTime } from "@/api/app"
import { setLastTime } from "@/api/app"
import { setPlayLastTime } from "@/api/app"
import { defineStore } from 'pinia'

export const useTimeStore = defineStore('timestamp', {
  state: () => ({
    timestamp: null,
  }),
  getters: {
    getTimestamp: (state) => state.timestamp,
  },
  actions: {
    async loadTimestamp() {
      // call your API helper, get back a Date or string
      const ts = await getLastTime()
      this.timestamp = ts
    },
    async setTimestamp(ts) {
      this.timestamp = ts
      await setLastTime(ts)
    },
  },
})

export const usePlayTimeStore = defineStore('play_timestamp', {
  state: () => ({
    play_timestamp: null,
  }),
  getters: {
    getPlayTimestamp: (state) => state.play_timestamp,
  },
  actions: {
    async loadPlayTimestamp() {
      // call your API helper, get back a Date or string
      const play_ts = await getPlayLastTime()
      this.play_timestamp = play_ts
    },
    async setPlayTimestamp(play_ts) {
      this.play_timestamp = play_ts
      await setPlayLastTime(play_ts)
    },
  },
})
