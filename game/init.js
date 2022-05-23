export default function setupExternalUI(id) {
  const container = document.createElement('div')
  container.id = id
  document.body.appendChild(container)

  const canvas = document.createElement('canvas')
  container.appendChild(canvas)


  return { canvas }
}