export default function setupExternalUI(id) {
  const container = document.createElement('div')
  container.id = id
  document.body.appendChild(container)

  const canvas = document.createElement('canvas')
  canvas.id = 'gameCanvas'
  container.appendChild(canvas)

  const panel = document.createElement('div')
  panel.id = 'panel'
  container.appendChild(panel)

  const jailBlack = document.createElement('div')
  jailBlack.id = 'jailBlack'
  jailBlack.className = 'jail'
  panel.appendChild(jailBlack)

  const turnContainerRed = document.createElement('div')
  turnContainerRed.className = 'turnContainer'
  turnContainerRed.id = 'turnContainerRed'
  panel.appendChild(turnContainerRed)

  const turnIndicatorRed = document.createElement('div')
  turnIndicatorRed.className = 'turn-indicator'
  turnIndicatorRed.id = 'turnIndicatorRed'
  turnContainerRed.appendChild(turnIndicatorRed)

  const passRed = document.createElement('button')
  passRed.id = 'passRed'
  passRed.className = 'turn-passButton'
  turnContainerRed.appendChild(passRed)
  passRed.innerText = 'Pass'

  const infobox = document.createElement('div')
  infobox.id = 'infobox'
  panel.appendChild(infobox)


  const score = document.createElement('div')
  score.id = 'info-score'
  infobox.appendChild(score)

  const scoreRed = document.createElement('span')
  scoreRed.id = 'info-score-red'
  score.appendChild(scoreRed)

  const scoreBlack = document.createElement('span')
  scoreBlack.id = 'info-score-black'
  score.appendChild(scoreBlack)

  const gameInfo = document.createElement('div')
  gameInfo.id = 'info-game'
  infobox.appendChild(gameInfo)

  const matchNo = document.createElement('span')
  matchNo.id = 'info-game-matchNo'
  gameInfo.appendChild(matchNo)

  const turn = document.createElement('span')
  turn.id = 'info-game-turn'
  gameInfo.appendChild(turn)

  const status = document.createElement('div')
  status.id = 'info-status'
  infobox.appendChild(status)

  const newMatchButton = document.createElement('button')
  newMatchButton.id = 'newMatchButton'
  newMatchButton.innerText = 'Setup New Match'
  panel.appendChild(newMatchButton)

  const turnContainerBlack = document.createElement('div')
  turnContainerBlack.className = 'turnContainer'
  turnContainerBlack.id = 'turnContainerBlack'
  panel.appendChild(turnContainerBlack)

  const turnIndicatorBlack = document.createElement('div')
  turnIndicatorBlack.className = 'turn-indicator'
  turnIndicatorBlack.id = 'turnIndicatorBlack'
  turnContainerBlack.appendChild(turnIndicatorBlack)

  const passBlack = document.createElement('button')
  passBlack.id = 'passBlack'
  passBlack.className = 'turn-passButton'
  turnContainerBlack.appendChild(passBlack)
  passBlack.innerText = 'Pass'

  const jailRed = document.createElement('div')
  jailRed.className = 'jail'
  jailRed.id = 'jailRed'
  panel.appendChild(jailRed)

  // debug
  jailBlack.innerText = 'im here'
  jailRed.innerText = 'im here too'
  scoreRed.innerText = 'Red: 0'
  scoreBlack.innerText = 'Black: 0'
  matchNo.innerText = 'Game: 1/3'
  turn.innerText = 'Turn: 1'
  status.innerText = 'Here is where messages for the players show up.'
  turnIndicatorBlack.innerText = 'O'
  turnIndicatorRed.innerText = 'O'

  
  return { canvas }
}