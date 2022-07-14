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
  jailCells = []

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
    this.scoreRed.innerText = 'Red: $redscore'
    this.scoreBlack.innerText = 'Black: $blackscore'
    this.matchInfo.innerText = 'Game: $no/$len'
    this.turn.innerText = 'Turn: $turn'
    this.statusMsg.innerText = '$msg'
    console.info('%cUI initializing', 'color: orange')
  }

  update(game) {
    this.scoreRed.innerHTML = `Red: ${game.match.red}`
    this.scoreBlack.innerHTML = `Black: ${game.match.black}`
    this.matchInfo.innerHTML = `Game: ${game.match.gameNo}/${game.match.matchLength}`
    this.turn.innerHTML = `Turn: ${game.turnCount}`
    this.statusMsg.innerHTML = `${game.msg}`

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

    // WARN may be superfluous
    console.log('this.jailCells.length', this.jailCells.length)
    console.log('jailBlack childnodes', this.jailBlack.childNodes )
    this.jailCells.forEach(({ jailedDisc }) => {
      jailedDisc.update() 
    })

  }

  jailDisc(disc) {
    // Called by game and adds a canvas and JailDisc to a jail cell
    console.log(`jailing disc`, )
    
    const jailCell = document.createElement('canvas')
    jailCell.className = 'jailCell'

    const jailedDisc = new BaseDisc(jailCell, disc.color) 
    jailedDisc.isKing = disc.isKing

    this.jailCells.push({ jailCell, jailedDisc })

    if (disc.color === CONSTANTS.RED) {
      this.jailBlack.appendChild(jailCell)
      console.log(`appended jailCell to jailBlack`, )
    } else {
      this.jailRed.appendChild(jailCell)
      console.log(`appended jailCell to jailRed`, )
    }
    // console.log(`jailCell`, jailCell)
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