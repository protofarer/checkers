import BaseDisc from '../CanvasComponents/BaseDisc'
import CONSTANTS from '../Constants'

export default class externalUI {
  container = document.createElement('div')
  canvas = document.createElement('canvas')
  panel = document.createElement('div')
  jailRed = document.createElement('div')
  turnContainerRed = document.createElement('div')
  turnIndicatorRed = document.createElement('div')
  passRed = document.createElement('button')
  infobox = document.createElement('div')
  score = document.createElement('div')
  scoreRed= document.createElement('span')
  scoreBlack= document.createElement('span')
  gameInfo = document.createElement('div')
  matchInfo = document.createElement('span')
  turn = document.createElement('span')
  statusMsg = document.createElement('div')
  newMatchButton = document.createElement('button')
  turnContainerBlack = document.createElement('div')
  turnIndicatorBlack = document.createElement('div')
  passBlack = document.createElement('button')
  jailBlack = document.createElement('div')

  jailCanvases = {
    reds: [],
    blacks: []
  }
  constructor() {
    document.body.appendChild(this.container)

    this.container.id = 'game'

    this.canvas.id = 'gameCanvas'
    this.container.appendChild(this.canvas)

    this.panel.id = 'panel'
    this.container.appendChild(this.panel)
  
    this.jailRed.className = 'jail'
    this.jailRed.id = 'jailRed'
    this.panel.appendChild(this.jailRed)
  
    this.turnContainerRed.className = 'turnContainer'
    this.turnContainerRed.id = 'turnContainerRed'
    this.panel.appendChild(this.turnContainerRed)
  
    this.turnIndicatorRed.className = 'turn-indicator'
    this.turnIndicatorRed.id = 'turnIndicatorRed'
    this.turnContainerRed.appendChild(this.turnIndicatorRed)
  
    this.passRed.id = 'passRed'
    this.passRed.className = 'turn-passButton'
    this.turnContainerRed.appendChild(this.passRed)
  
    this.infobox.id = 'infobox'
    this.panel.appendChild(this.infobox)
  
    this.score.id = 'info-score'
    this.infobox.appendChild(this.score)
  
    this.scoreRed.id = 'info-score-red'
    this.score.appendChild(this.scoreRed)

    this.scoreBlack.id = 'info-score-black'
    this.score.appendChild(this.scoreBlack)
  
    this.gameInfo.id = 'info-game'
    this.infobox.appendChild(this.gameInfo)
  
    this.matchInfo.id = 'info-game-matchInfo'
    this.gameInfo.appendChild(this.matchInfo)
  
    this.turn.id = 'info-game-turn'
    this.gameInfo.appendChild(this.turn)
  
    this.statusMsg.id = 'info-status'
    this.infobox.appendChild(this.statusMsg)

    this.newMatchButton.id = 'newMatchButton'
    this.newMatchButton.innerText = 'Setup New Match'
    this.infobox.appendChild(this.newMatchButton)
  
    this.turnContainerBlack.className = 'turnContainer'
    this.turnContainerBlack.id = 'turnContainerBlack'
    this.panel.appendChild(this.turnContainerBlack)
  
    this.turnIndicatorBlack.className = 'turn-indicator'
    this.turnIndicatorBlack.id = 'turnIndicatorBlack'
    this.turnContainerBlack.appendChild(this.turnIndicatorBlack)

    this.passBlack.id = 'passBlack'
    this.passBlack.className = 'turn-passButton'
    this.turnContainerBlack.appendChild(this.passBlack)

    this.jailBlack.id = 'jailBlack'
    this.jailBlack.className = 'jail'
    this.panel.appendChild(this.jailBlack)
  
    // debug
    this.passRed.innerText = '$pass'
    this.passBlack.innerText = '$pass'
    this.jailBlack.innerText = '$blackjail'
    this.jailRed.innerText = '$redjail'
    this.scoreRed.innerText = 'Red: $redscore'
    this.scoreBlack.innerText = 'Black: $blackscore'
    this.matchInfo.innerText = 'Game: $no/$len'
    this.turn.innerText = 'Turn: $turn'
    this.statusMsg.innerText = '$msg'

  }

  update(game) {
    console.info('%cUI initializing', 'color: orange')
    this.scoreRed.innerHTML = `Red: ${game.match.red}`
    this.scoreBlack.innerHTML = `Black: ${game.match.black}`
    this.matchInfo.innerHTML = `Game: ${game.match.gameNo}/${game.match.matchLength}`
    this.turn.innerHTML = `Turn: ${game.turnCount}`
    this.statusMsg.innerHTML = `${game.msg}`
    // this.jailBlack.innerHTML = `Reds captured: ${game.captures.capturedReds.length}`
    // this.jailRed.innerHTML = `Blacks captured: ${game.captures.capturedBlacks.length}`
    this.jailBlack.innerHTML = ``
    this.jailRed.innerHTML = ``

    if (game.turnColor === CONSTANTS.BLACK) {
      this.passBlack.style.backgroundColor = 'hsl(210, 90%, 85%)'
      this.passBlack.innerHTML = 'Pass'
      this.passRed.style.backgroundColor = 'lightgrey'
      this.passRed.innerHTML = '&nbsp;'
      this.turnIndicatorBlack.style.backgroundColor = 'hsl(100, 100%, 45%)'
      this.turnIndicatorRed.style.backgroundColor = 'lightgrey'
    } else {
      this.passRed.style.backgroundColor = 'hsl(210, 90%, 85%)'
      this.passRed.innerHTML = 'Pass'
      this.passBlack.style.backgroundColor = 'lightgrey'
      this.passBlack.innerHTML = '&nbsp;'
      this.turnIndicatorRed.style.backgroundColor = 'hsl(100, 100%, 45%)'
      this.turnIndicatorBlack.style.backgroundColor = 'lightgrey'
    }
    // this.drawCapturedDiscs()
  }

  jailDisc(disc) {
    // Converts a BoardDisc to BaseDisc and draws it appropriately in jail
    const canvas = document.createElement('canvas')
    disc.color === CONSTANTS.BLACK 
      && this.jailCanvases.blacks.push(new BaseDisc(canvas, disc.color))
    disc.color === CONSTANTS.RED 
      && this.jailCanvases.reds.push(new BaseDisc(canvas, disc.color))

    // TODO when disc is captured it must be modified to fit in jail
  }

  drawJailedDisc(canvas, ctx, disc) {
    // canvas must be square

    // req'd disc props:
    //  mod disc props: ctx, radius, center, 
    //  read disc props: color, isKing
    //  use methods:  draw

    // TODO make clean copy

    // TODO modify props


  }

  drawJailedDiscs() {
    this.jailCanvases.reds.forEach(
      ({ canvas, ctx, disc}) => this.drawCapturedDisc(canvas, ctx, disc)
    )
    this.jailCanvases.blacks.forEach(
      ({ canvas, ctx, disc }) => this.drawCapturedDisc(canvas, ctx, disc)
    )
  }
}