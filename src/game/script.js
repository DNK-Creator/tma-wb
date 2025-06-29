import { setupGround, updateGround } from './ground.js'
import {
  setupDino,
  updateDino,
  getDinoRect,
  setDinoLose,
  onJump,
} from './dino.js'
import {
  setupCactus,
  updateCactus,
  getCactusRects
} from './cactus.js'
import {
  setupReward,
  updateReward,
  getRewardRects
} from './reward.js'

const WORLD_WIDTH = 100
const WORLD_HEIGHT = 27
const SPEED_SCALE_INCREASE = 0.00001

let lastTime = null
let speedScale = 1
let rewardScore = 0
let rareScore = 0
let gameStarted
let startScreenElem
let actionButtonElem

export function setPixelToWorldScale() {
  const worldElement = document.querySelector('[data-world]')
  if (!worldElement) return

  let worldToPixelScale
  if (
    window.innerWidth / window.innerHeight <
    WORLD_WIDTH / WORLD_HEIGHT
  ) {
    worldToPixelScale = window.innerWidth / WORLD_WIDTH
  } else {
    worldToPixelScale = window.innerHeight / WORLD_HEIGHT
  }

  worldElement.style.width = `${WORLD_WIDTH * worldToPixelScale}px`
  worldElement.style.height = `${WORLD_HEIGHT * worldToPixelScale}px`
}

export function startGameLoop() {
//   document.addEventListener('keydown', handleStart, { once: true })
}

export function startGame() {
    if(gameStarted) return
    gameStarted = true
    const startScreenElem = document.querySelector(
        '[data-start-screen]'
    )
    if (!startScreenElem) return

    setupGround()
    setupDino()
    setupCactus()
    setupReward()
    speedScale = 1
    rewardScore = 0
    rareScore = 0
    lastTime = null

    if (actionButtonElem) actionButtonElem.textContent = 'Прыжок'
    if (actionButtonElem) actionButtonElem.classList.remove('hide')
    if (startScreenElem) startScreenElem.classList.add('hide')

    window.requestAnimationFrame(update)

}

// Called by the button for jump
export function jump() {
  if (!gameStarted) return
  onJump({ code: 'Space' })
}


function checkLose() {
  const dinoRect = getDinoRect()
  return getCactusRects().some(cactusRect =>
    isCollision(cactusRect, dinoRect)
  )
}

function isCollision(rect1, rect2) {
  return (
    rect1.left < rect2.right &&
    rect1.top < rect2.bottom &&
    rect1.right > rect2.left &&
    rect1.bottom > rect2.top
  )
}

export function resetDefault() {
    lastTime = null
}

function update(time) {
  if (lastTime === null) {
    lastTime = time
    window.requestAnimationFrame(update)
    return
  }

  const delta = time - lastTime

  updateGround(delta, speedScale)
  updateDino(delta, speedScale)
  updateCactus(delta, speedScale)
  updateSpeedScale(delta)
  updateReward(delta, speedScale)

   // reward collision
  document.querySelectorAll('[data-reward]').forEach(reward => {
    const rect = reward.getBoundingClientRect()
    if (isCollision(rect, getDinoRect())) {
      // remove the actual reward element
      reward.remove()
      // increment appropriate score
      if (reward.dataset.reward === 'normal') {
        rewardScore++
      } else if (reward.dataset.reward === 'rare') {
        rareScore++
      }

        // now immediately update your on‑screen text
        const simpleEl = document.querySelector('[data-simple-score]')
        const rareEl   = document.querySelector('[data-rare-score]')
        if (simpleEl) simpleEl.textContent = `Монеток: ${rewardScore}`
        if (rareEl)   rareEl.textContent   = `Билетов: ${rareScore}`
    }
  })


  if (checkLose()) {
    handleLose()
    return
  }

    // win condition
  if (rewardScore >= 30) {
    showCongratulationsModal()
    return
  }

  lastTime = time
  window.requestAnimationFrame(update)
}

function handleLose() {
    // visually dead
    setDinoLose()
    window.dispatchEvent(new CustomEvent('game-lose', {
        detail: { rewardScore, rareScore }
    }))
    // hide the jump button
    setTimeout(() => {
        lastTime = null
        setupGround()
        setupDino()
        setupCactus()
        setupReward()
        speedScale = 1
        if (actionButtonElem) actionButtonElem.classList.add('hide')
    }, 1500);
}

export function showCongratulationsModal() {
    window.dispatchEvent(new CustomEvent('game-win', {
        detail: { rewardScore, rareScore }
    }))

    setTimeout(() => {
        lastTime = null
        setupGround()
        setupDino()
        setupCactus()
        setupReward()
        speedScale = 1
        if (actionButtonElem) actionButtonElem.classList.add('hide')
    }, 1500);
}

function updateSpeedScale(delta) {
  speedScale += delta * SPEED_SCALE_INCREASE
}

export function initUIRefs() {
  startScreenElem = document.querySelector('[data-start-screen]')
  actionButtonElem = document.querySelector('[data-action-button]')
}