import {
  incrementCustomProperty,
  getCustomProperty,
  setCustomProperty
} from "./updateCustomProperty.js"

const JUMP_SPEED = 0.45
const GRAVITY = 0.0015
const DINO_FRAME_COUNT = 2
const FRAME_TIME = 100

let isJumping
let dinoFrame
let currentFrameTime
let dinoElem    // module‑scoped reference to the <img data-dino>
let yVelocity

// Call in handleStart()
export function setupDino() {
  dinoElem = document.querySelector('[data-dino]')
  isJumping = false
  dinoFrame = 0
  currentFrameTime = 0
  yVelocity = 0
  setCustomProperty(dinoElem, "--bottom", 0)

  // Ensure stationary frame initially
  dinoElem.src = new URL(
    '../assets/Game/dino-stationary.png',
    import.meta.url
  ).href

//   document.removeEventListener('keydown', onJump)
//   document.addEventListener('keydown', onJump)
}

export function setDinoLose() {
  dinoElem.src = new URL(
    '../assets/Game/dino-lose.png',
    import.meta.url
  ).href
}

export function updateDino(delta, speedScale) {
  handleRun(delta, speedScale)
  handleJump(delta)
}

export function getDinoRect() {
  // Fixed typo: getBoundingClientRect()
  return dinoElem.getBoundingClientRect()
}

function handleRun(delta, speedScale) {
  if (!dinoElem) return

  if (isJumping) {
    dinoElem.src = new URL(
      '../assets/Game/dino-stationary.png',
      import.meta.url
    ).href
    return
  }

  if (currentFrameTime >= FRAME_TIME) {
    dinoFrame = (dinoFrame + 1) % DINO_FRAME_COUNT
    dinoElem.src = new URL(
      `../assets/Game/dino-run-${dinoFrame}.png`,
      import.meta.url
    ).href
    currentFrameTime -= FRAME_TIME
  }

  currentFrameTime += delta * speedScale
}

function handleJump(delta) {
  if (!isJumping) return

  incrementCustomProperty(
    dinoElem,
    "--bottom",
    yVelocity * delta
  )

  if (getCustomProperty(dinoElem, "--bottom") <= 0) {
    setCustomProperty(dinoElem, "--bottom", 0)
    isJumping = false
  }

  yVelocity -= GRAVITY * delta
}

export function onJump(e) {
  if (e.code !== 'Space' || isJumping) return
  yVelocity = JUMP_SPEED
  isJumping = true
}