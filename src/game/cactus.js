import {
  getCustomProperty,
  incrementCustomProperty,
  setCustomProperty
} from './updateCustomProperty.js'

const SPEED = 0.05
const CACTUS_INTERVAL_MIN = 1000
const CACTUS_INTERVAL_MAX = 3400

let nextCactusTime
let worldElem

export function setupCactus() {
  worldElem = document.querySelector('[data-world]')
  nextCactusTime = (CACTUS_INTERVAL_MAX + CACTUS_INTERVAL_MIN) / 2
  // Remove any existing cacti on restart
  document.querySelectorAll('[data-cactus]').forEach(c => c.remove())
}

export function updateCactus(delta, speedScale) {
  document.querySelectorAll('[data-cactus]').forEach(cactus => {
    incrementCustomProperty(
      cactus,
      '--left',
      delta * speedScale * SPEED * -1
    )
    if (getCustomProperty(cactus, '--left') <= -100) {
      cactus.remove()
    }
  })

  if (nextCactusTime <= 0) {
    createCactus()
    nextCactusTime =
      randomNumberBetween(CACTUS_INTERVAL_MIN, CACTUS_INTERVAL_MAX) /
      speedScale
  }

  nextCactusTime -= delta
}

export function getCactusRects() {
  return [...document.querySelectorAll('[data-cactus]')].map(cactus =>
    cactus.getBoundingClientRect()
  )
}

function createCactus() {
  if (!worldElem) return

  const cactus = document.createElement('img')
  cactus.dataset.cactus = 'true'
  cactus.src = new URL(
    '../assets/Game/BUSH-FLOWERS.png',
    import.meta.url
  ).href
  cactus.classList.add('cactus')
  setCustomProperty(cactus, '--left', 100)

  worldElem.append(cactus)
}

function randomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}