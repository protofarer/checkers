import BaseDisc from '../CanvasComponents/BaseDisc'
import CONSTANTS from '../Constants'

export default class Panel {
  panelContainer = document.createElement('div')
  managerRed = document.createElement('div')
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
  managerBlack = document.createElement('div')
  turnContainerBlack = document.createElement('div')
  turnIndicatorBlack = document.createElement('div')
  passBlack = document.createElement('button')
  jailBlack = document.createElement('div')
  jailCells = []
  game = null

  constructor() {
    this.panelContainer.id = 'panel'

    this.managerRed.className = 'colorManager'
    this.panelContainer.appendChild(this.managerRed)

    this.jailRed.className = 'jail'
    this.jailRed.id = 'jailRed'
    this.managerRed.appendChild(this.jailRed)

    this.turnContainerRed.className = 'turnContainer'
    this.turnContainerRed.id = 'turnContainerRed'
    this.managerRed.appendChild(this.turnContainerRed)
  
    this.turnIndicatorRed.className = 'turn-indicator'
    this.turnIndicatorRed.id = 'turnIndicatorRed'
    this.turnContainerRed.appendChild(this.turnIndicatorRed)
  
    this.passRed.id = 'passRed'
    this.passRed.className = 'turn-passButton'
    this.turnContainerRed.appendChild(this.passRed)
  
    this.infobox.id = 'infobox'
    this.panelContainer.appendChild(this.infobox)
  
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
    this.newMatchButton.innerText = 'New Match'
    this.infobox.appendChild(this.newMatchButton)
  
    this.managerBlack.className = 'colorManager'
    this.panelContainer.appendChild(this.managerBlack)

    this.turnContainerBlack.className = 'turnContainer'
    this.turnContainerBlack.id = 'turnContainerBlack'
    this.managerBlack.appendChild(this.turnContainerBlack)
  
    this.turnIndicatorBlack.className = 'turn-indicator'
    this.turnIndicatorBlack.id = 'turnIndicatorBlack'
    this.turnContainerBlack.appendChild(this.turnIndicatorBlack)

    this.passBlack.id = 'passBlack'
    this.passBlack.className = 'turn-passButton'
    this.turnContainerBlack.appendChild(this.passBlack)

    this.jailBlack.id = 'jailBlack'
    this.jailBlack.className = 'jail'
    this.managerBlack.appendChild(this.jailBlack)
  
    // before init, for debug
    this.passRed.innerText = '$pass'
    this.passBlack.innerText = '$pass'
    this.scoreRed.innerText = 'Red: $redscore'
    this.scoreBlack.innerText = 'Black: $blackscore'
    this.matchInfo.innerText = 'Game: $no/$len'
    this.turn.innerText = 'Turn: $turn'
    this.statusMsg.innerText = '$msg'
    console.info('%cUI initializing', 'color: orange')
  }

  init(game) {
    // Call after game is initialized
    this.game = game
    this.setupEventListeners()
    this.update()
  }

  setupEventListeners() {
    this.newMatchButton.addEventListener('click', () => {
      window.location.replace('/')
    })
    this.passRed.addEventListener('click', () => {
      this.game.passTurn(CONSTANTS.RED)
    })
    this.passBlack.addEventListener('click', () => {
      this.game.passTurn(CONSTANTS.BLACK)
    })
  }

  update() {
    this.scoreRed.innerHTML = `Red: ${this.game.match.red}`
    this.scoreBlack.innerHTML = `Black: ${this.game.match.black}`
    this.matchInfo.innerHTML = `\
      Game: ${this.game.match.gameNo}/${this.game.match.matchLength}`
    this.turn.innerHTML = `Turn: ${this.game.turnCount}`

    this.statusMsg.innerHTML = `${this.game.msg}`
    const delayClr = (delay) => new Promise(res => setTimeout(res, delay))
    delayClr(4000)
      .then(() => this.statusMsg.innerHTML = '')

    if (this.game.turnColor === CONSTANTS.BLACK) {
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
      jailedDisc.clr()
      jailedDisc.update() 
    })
  }

  jailDisc(disc) {
    // Called by game and adds a canvas and JailDisc to a jail cell
    console.log(`jailing disc`, )
    
    // disc.summon(color, className, {w, h})
    const jailCell = document.createElement('canvas')
    jailCell.className = 'jailCell'
    // jailCell.width = jailCell.height = 120

    const jailedDisc = new BaseDisc(jailCell, disc.color) 
    jailedDisc.isKing = disc.isKing

    this.jailCells.push({ jailCell, jailedDisc })

    const jailColor = disc.color === CONSTANTS.RED ? this.jailBlack : this.jailRed

    // TODO optimize by using exact window / element dims
    if (window.innerWidth / window.innerHeight <= 0.75) {
      console.log(`IN jailDisc 3/4 dims`, )
      console.log(`jailColor.clientW/h`, jailColor.clientWidth, jailColor.clientHeight)
      jailCell.width = jailCell.height = jailColor.clientHeight * 0.25
    } else {
      jailCell.width = jailCell.height = jailColor.clientWidth * 0.4
    }
    jailColor.appendChild(jailCell)
    this.update()
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