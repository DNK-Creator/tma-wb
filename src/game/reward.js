import {
  getCustomProperty,
  incrementCustomProperty,
  setCustomProperty
} from './updateCustomProperty.js'

const SPEED = 0.05              // slightly slower than cacti
const INTERVAL_MIN = 400
const INTERVAL_MAX = 3000
const FLY_AMPLITUDE = 4         // percent of world height
const FLY_SPEED = 0.0015         // how fast it bobs up/down
const RARE_CHANCE = 1 / 25

let nextRewardTime
let worldElem
let bobTime = 0

export function setupReward() {
  worldElem = document.querySelector('[data-world]')
  nextRewardTime = INTERVAL_MIN
  bobTime = 0
  // clear old rewards
  document.querySelectorAll('[data-reward]').forEach(r => r.remove())
}

export function updateReward(delta, speedScale) {
  // Bob time advance
  bobTime += delta * FLY_SPEED * speedScale

  // Move existing rewards
  document.querySelectorAll('[data-reward]').forEach(el => {
    // horizontal
    incrementCustomProperty(
      el,
      '--left',
      delta * speedScale * SPEED * -1
    )
    // vertical bob
    const baseY = parseFloat(el.dataset.baseY)
    const y = baseY + Math.sin(bobTime + parseFloat(el.dataset.phase)) * FLY_AMPLITUDE
    setCustomProperty(el, '--bottom', y)

    // remove off‑screen
    if (getCustomProperty(el, '--left') <= -100) el.remove()
  })

  // Spawn new reward
  if (nextRewardTime <= 0) {
    createReward()
    nextRewardTime = randomBetween(INTERVAL_MIN, INTERVAL_MAX) / speedScale
  }
  nextRewardTime -= delta
}

export function getRewardRects() {
  return [...document.querySelectorAll('[data-reward]')].map(el => el.getBoundingClientRect())
}

function createReward() {
  if (!worldElem) return

  const el = document.createElement('img')
  const isRare = Math.random() < RARE_CHANCE
  el.dataset.reward = isRare ? 'rare' : 'normal'
  el.src = new URL(
    `../assets/Game/${isRare ? 'gamble' : 'NUT'}.png`,
    import.meta.url
  ).href
  el.classList.add('reward')
  el.style.transform = 'scale(1.5)'
  el.style.transformOrigin = 'center'

  // start off‑screen right
  setCustomProperty(el, '--left', 100)

  // pick a lower Y
  const baseY = randomBetween(40, 50)
  el.dataset.baseY = baseY
  el.dataset.phase = Math.random() * Math.PI * 2

  // ←— **seed the bottom** so there's no visual jump
  setCustomProperty(el, '--bottom', baseY)

  worldElem.append(el)
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}