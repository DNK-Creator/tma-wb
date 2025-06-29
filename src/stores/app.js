import {
  getOrCreateUser,
  registerRef,
  fetchTasks,
  completeTask,
  checkMember,
  fetchReferals,
} from '@/api/app'
import { defineStore } from 'pinia'
import { useScoreStore } from './score'
import { useSpinsStore } from './score'
import { usePlayReadyStore } from './playStore'
import { usePlayTimeStore, useTimeStore } from './timecheck'
import { useTelegram } from '@/services/telegram'

const { user } = useTelegram()

export async function getReferals() {
  await fetchReferals()
}

export const useAppStore = defineStore('app', {
  state: () => ({
    user: {},
    tasks: [],
    not_done_tasks: []
  }),
  actions: {
    async init(ref) {
      this.user = await getOrCreateUser()

      const score = useScoreStore()
      score.setScore(this.user.score)

      const spins = useSpinsStore()
      spins.setSpins(this.user.spins)

      const timestamp = useTimeStore()
      timestamp.setTimestamp(this.user.timestamp)

      const play_timestamp = usePlayTimeStore()
      play_timestamp.setPlayTimestamp(this.user.play_timestamp)

      const play_ready = usePlayReadyStore()
      play_ready.setPlayReady(this.user.play_ready)

      if (ref && +ref !== +this.user.telegram) {
        await registerRef(user?.first_name ?? 'Monkey Bot', ref)
      }
      await fetchTasks()
    },
    async completeTask(task) {
      await completeTask(this.user, task)
    },
    // inside your Pinia store’s actions:
    async fetchTasks() {
      // 1) load all sponsors
      const all = await fetchTasks() // from api/app.js
      const kept = []
      const notDone = []

      for (const sponsor of all) {
        const member = await checkMember(sponsor.shortlink)
        if (member === null) {
          // bot cannot access — drop this one
          console.warn(`Skipping inaccessible: ${sponsor.shortlink}`)
          continue
        }
        kept.push(sponsor)
        notDone.push(member)
      }

      this.tasks = kept
      this.not_done_tasks = notDone
      console.log(this.not_done_tasks)
      console.log(this.tasks)

      // return true only if there are sponsors and all are “done”
      return this.not_done_tasks.length > 0
          && this.not_done_tasks.every(v => v === true)
    },
    checkSponsors() { 
      return (
      this.not_done_tasks.length > 0 &&
      this.not_done_tasks.every((t) => t === true)
      );
    }
  },
})