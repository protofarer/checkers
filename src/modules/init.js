import { resetGame } from '../main.js'

export default function setupExternalUI(id) {
  const container = document.createElement('div')
  container.id = id
  document.body.appendChild(container)

  const canvas = document.createElement('canvas')
  container.appendChild(canvas)

  document.addEventListener('keydown', handleKeydown)
  function handleKeydown(e) {
    if (e.key === '`') {
      resetGame(true)
    } else if (e.key === '~') {
      resetGame(false)
    }
  }

  return { canvas }
}