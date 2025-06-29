import { defineStore } from 'pinia'
import debounce from 'lodash.debounce'
import { updateScore } from '@/api/app'
import { updateSpins } from '@/api/app'

const debouncedUpdateScore = debounce(updateScore, 500)
const debouncedUpdateSpins = debounce(updateSpins, 500)

export const useScoreStore = defineStore('score', {
  state: () => ({
    score: 0,
  }),
  getters: {
    currentScore(state) {
        return state.score
    },
  },
  actions: {
    add(score = 1) {
      this.score += score
      debouncedUpdateScore(this.score)
    },
    spend(score = 1) {
      this.score -= score
      debouncedUpdateScore(this.score)
    },
    setScore(score) {
      this.score = score
      debouncedUpdateScore(this.score)
    },
  },
})

export const useSpinsStore = defineStore('spins', {
  state: () => ({
    spins: 1,
  }),
  getters: {
    currentSpins(state) {
        return state.spins
    },
  },
  actions: {
    add(spins = 1) {
      this.spins += spins
      debouncedUpdateSpins(this.spins)
    },
    spend(spins = 1) {
      this.spins -= spins
      debouncedUpdateSpins(this.spins)
    },
    setSpins(spins) {
      this.spins = spins
      debouncedUpdateSpins(this.spins)
    },
  },
})
