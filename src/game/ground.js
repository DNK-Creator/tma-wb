// /src/game/ground.js
import {
  getCustomProperty,
  setCustomProperty,
  incrementCustomProperty
} from './updateCustomProperty.js'

let groundElems = []       // will hold the two image elements
const SPEED = 0.05

export function setupGround() {
  // Now runs after mount, so these elements exist
  groundElems = Array.from(document.querySelectorAll('[data-ground]'))
  if (groundElems.length < 2) return

  setCustomProperty(groundElems[0], '--left', 0)
  setCustomProperty(groundElems[1], '--left', 300)
}

export function updateGround(delta, speedScale) {
  if (groundElems.length < 2) return

  groundElems.forEach(ground => {
    incrementCustomProperty(
      ground,
      '--left',
      delta * speedScale * SPEED * -1
    )

    // if it's fully off to the left (< -300%), jump it ahead 600%
    if (getCustomProperty(ground, '--left') <= -300) {
      incrementCustomProperty(ground, '--left', 600)
    }
  })
}
