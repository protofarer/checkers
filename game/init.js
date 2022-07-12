export default function setupExternalUI(id) {
  const container = document.createElement('div')
  container.id = id
  document.body.appendChild(container)

  const canvas = document.createElement('canvas')
  canvas.id = 'gameCanvas'
  container.appendChild(canvas)

  return { canvas }
}