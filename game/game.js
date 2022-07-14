import BoardDisc from './CanvasComponents/BoardDisc'
import Panel from './WebComponents/Panel'
import CONSTANTS from './Constants'
import EndDialog from './CanvasComponents/EndDialog'
import initSounds from './audio'

export default class Game {
  constructor (match, debugMode=false, debugOverlay=false) {
    this.debugMode = debugMode
    this.debugOverlay = debugOverlay
    this.debugDiscPositionMarker = ''

    this.match = match

    this.mouseCoords = { 
      canvas: {
        x: 0, y: 0
      },
      board: {
        x: 0, y: 0
      },
      client: {
        x: 0, y: 0
      },
      square: {
        col: 0, row: 0
      }
    }

    // Captors and Movers determined only after a disc has changed positions.
    this.carefrees = []
    this.enticed = []

    this.msg = ''
    this.turnCount = 1
    this.turnColor = CONSTANTS.BLACK
    this.phase = CONSTANTS.PHASE_PLAY    // new, playing, end
    this.winner = ''
    this.captures = {
      capturedBlacks: [],
      capturedReds: [],
    }
    this.hasCaptureChainStarted = false
    this.lastPassedTurn = -1
    this.wasThisTurnPassed = false

    this.container = document.createElement('div')
    this.container.id = 'game'
    document.body.appendChild(this.container)

    this.canvas = document.createElement('canvas')
    this.canvas.id = 'gameCanvas'
    this.container.appendChild(this.canvas)

    this.ctx = this.canvas.getContext('2d')

    this.panel = new Panel()
    this.container.appendChild(this.panel.panelContainer)

    this.board = this.debugMode
      ? CONSTANTS.BOARD_INIT_DEBUG
      : CONSTANTS.BOARD_INIT_PROD

    this.discs = []
    
    this.boardHeight = 800
    this.boardWidth = 800
    this.baseThickness = 40      // decorative graphic around board
    
    // Play area is the active area of board, ie not including baseboard
    // and defined as such to calculate based off coordinates relative to
    // the interior of the board itself. The board's absolute position
    // is modified by:
    // canvas's offset in window (e.clientX,Y)
    // board's offset in canvas (playAreaOffset.x,y)
    this.playAreaOffset = {
      x: this.baseThickness,
      y: this.baseThickness,
    }


    this.endDialog = new EndDialog(this)

    this.canvas.width = this.boardWidth + 2 * this.baseThickness
    this.canvas.height = this.boardHeight + 2 * this.baseThickness

    this.rect = this.canvas.getBoundingClientRect()

    const Sounds = initSounds()
    this.sounds = Sounds.sounds
    this.play = Sounds.play

    this.pointerCoords = { 
      canvas: {
        x: 0, y: 0
      },
      board: {
        x: 0, y: 0
      },
      client: {
        x: 0, y: 0
      },
      square: {
        col: 0, row: 0
      }
    }

    this.ongoingTouches = new Array()

    this.initDiscs()
    this.updateDiscActors()
    this.setupEventListeners()

    this.panel.init(this)     // Invokes panel.update()
    this.drawBaseBoard()
  }

  passTurn(playerColor) {
      if (this.turnColor === playerColor) {
        this.wasThisTurnPassed = true
        this.nextTurn()
      }
  }

  initDiscs() {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        switch(this.board[i][j]) {
          case CONSTANTS.RED:
            this.discs.push(
              new BoardDisc(this.canvas, i, j, CONSTANTS.RED)
            )
            break
          case CONSTANTS.BLACK:
            this.discs.push(
              new BoardDisc(this.canvas, i, j, CONSTANTS.BLACK)
            )
            break
          case CONSTANTS.BLANK:
            break
          default:
            console.log('unhandled board object render')
        }
      }
    }
    if (this.debugMode) {
      for (let i = 0; i < 11; i++) {
      this.captures.capturedBlacks.push(
        new BoardDisc(this.canvas, 9, 9, CONSTANTS.BLACK)
      )
      this.captures.capturedReds.push(
        new BoardDisc(this.canvas, 9, 9, CONSTANTS.RED)
      )
      }
      this.captures.capturedBlacks[0].isKing = true
      this.captures.capturedReds[0].isKing = true
    }
  }

  boardToHTML() {
    let s = ''
    for (let r of this.board) {
      s += `${r.join(' ')}<br />`
    }
    return s
  }

  findNonCaptureMoves(disc) {
    let nonCaptureMoves = []
    if (disc.row + disc.direction >= 0 && 
        disc.row + disc.direction < 8) {
      if ((disc.col + 1 < 8) && 
          (this.board[disc.row + disc.direction][disc.col + 1] === 0)) {
        nonCaptureMoves.push({row: disc.row + disc.direction, col: disc.col + 1 })
      }
      if ((disc.col - 1 >= 0) && 
          (this.board[disc.row + disc.direction][disc.col - 1] === 0)) {
        nonCaptureMoves.push({ row: disc.row + disc.direction, col: disc.col - 1 })
      }
    }
    if (disc.isKing) {
      if (disc.row - disc.direction >= 0 && 
          disc.row - disc.direction < 8) {
        if ((disc.col + 1 < 8) && 
            (this.board[disc.row - disc.direction][disc.col + 1] === 0)) {
          nonCaptureMoves.push({row: disc.row - disc.direction, col: disc.col + 1 })
        }
        if ((disc.col - 1 >= 0) && 
            (this.board[disc.row - disc.direction][disc.col - 1] === 0)) {
          nonCaptureMoves.push({ row: disc.row - disc.direction, col: disc.col - 1 })
        }
      }
    }
    return nonCaptureMoves
  }

  findCaptureMoves(disc) {
    let captureMoves = []
    captureByDirection(1, this.board)

    if (disc.isKing) {
      captureByDirection(-1, this.board)
    }

    function captureByDirection(direction, board) {
      const opposingColor = disc.color === CONSTANTS.RED ? CONSTANTS.BLACK : CONSTANTS.RED
      // CSDR somehow binding board to this.board of Game
      if (disc.row + (2*disc.direction * direction) >= 0 &&
          disc.row + (2*disc.direction * direction) < 8) {
        if ((board[disc.row + disc.direction * direction][disc.col - 1] === opposingColor) && 
          (board[disc.row + (2*disc.direction * direction)][disc.col - 2] === 0)) {
            captureMoves.push({ row: disc.row + (2*disc.direction * direction), col: disc.col - 2 })
        }
        if ((board[disc.row + disc.direction  * direction][disc.col + 1] === opposingColor) &&
          (board[disc.row + (2*disc.direction * direction)][disc.col + 2] === 0)) {
            captureMoves.push({ row: disc.row + (2*disc.direction * direction), col: disc.col + 2 })
        }
      }
    }
    return captureMoves
  }

  updateDiscActors() {
    this.carefrees = this.findCarefrees()
    this.enticed = this.findEnticed()
  }

  // WARNING till function from disc class called
  findEnticed() {
    const enticed = this.discs.filter(disc => 
      this.findCaptureMoves(disc).length > 0 && disc.color === this.turnColor
    )
    return enticed
  }

  findCarefrees() {
    const carefrees = this.discs.filter(disc =>
      this.findNonCaptureMoves(disc).length > 0 && disc.color === this.turnColor)
    return carefrees
  }

  move(grabbedDisc, to, deathSound=null) {
    this.board[grabbedDisc.row][grabbedDisc.col] = 0
    this.board[to.row][to.col] = grabbedDisc.color
    grabbedDisc.row = to.row
    grabbedDisc.col = to.col
    grabbedDisc.updateDiscGeometry()
    this.updateDiscActors()

    if (grabbedDisc.row === 0 || grabbedDisc.row === 7) {
      grabbedDisc.direction *= -1
    }

    if ((grabbedDisc.row === 0 && grabbedDisc.color === CONSTANTS.BLACK)
    || (grabbedDisc.row === 7 && grabbedDisc.color === CONSTANTS.RED)) {
      // DISPATCH
      // 1.16 When a man reaches the farthest row forward (known as the “king-row” or “crown-head”) it becomes a king, and this completes the turn of play. 
      // 1.19 If a jump creates an immediate further capturing opportunity, then the capturing move of the piece (man or king) is continued until all the jumps are completed. The only exception is that if a man reaches the king-row by means of a capturing move it then becomes a king but may not make any further jumps until their opponent has moved.
      grabbedDisc.isKing = true
      if (deathSound !== null) {
        deathSound.addEventListener('ended', () => {
          this.sounds.king[0].currentTime = 0
          this.sounds.king[0].play()
        }, { once: true })
      } else {
        this.sounds.king[0].currentTime = 0
        this.sounds.king[0].play()
      }
      this.nextTurn()
    } else if (this.hasCaptureChainStarted && this.enticed.length === 0) {
      // DISPATCH
      this.nextTurn()
    } else if (!this.hasCaptureChainStarted) {
      this.nextTurn()
    }
  }

  // updateUI() {
  //   this.panel.update(
  //     { 
  //       match: { 
  //         red: this.match.red,
  //         black: this.match.black,
  //         gameNo: this.match.gameNo,
  //         matchLength: this.match.matchLength,
  //       },
  //       turnCount: this.turnCount,
  //       turnColor: this.turnColor,
  //       msg: this.msg
  //     }
  //   )
  // }
  
  capture(grabbedDisc, to) {
    const capturedDisc = this.findCaptured(grabbedDisc, to)
    if (capturedDisc.color === CONSTANTS.RED) {
      this.captures.capturedReds.push(capturedDisc)
    } else {
      this.captures.capturedBlacks.push(capturedDisc)
    }
    this.board[capturedDisc.row][capturedDisc.col] = 0
    this.discs = this.discs.filter(disc => 
      !(disc.row === capturedDisc.row && disc.col === capturedDisc.col)
    )
    capturedDisc.row = capturedDisc.col = 9

    this.hasCaptureChainStarted = true
    this.panel.jailDisc(capturedDisc)
    return capturedDisc
  }

  checkEndCondition() {
    if (this.enticed === 0 && this.carefrees === 0) {
      // DISPATCH WIN BY STALEMATE
      this.phase = CONSTANTS.PHASE_END
      this.winner = this.turnColor === CONSTANTS.RED 
        ? CONSTANTS.BLACK 
        : CONSTANTS.RED
    } else if (this.discs.filter(d => d.color === CONSTANTS.RED).length === 0) {
      // DISPATCH BLACK WINS
      this.phase = CONSTANTS.PHASE_END
      this.winner = CONSTANTS.BLACK
    } else if (this.discs.filter(d => d.color === CONSTANTS.BLACK).length === 0 ) {
      // DISPATCH RED WINS
      this.phase = CONSTANTS.PHASE_END
      this.winner = CONSTANTS.RED
    } else if (this.wasThisTurnPassed) {
      if (this.lastPassedTurn === this.turnCount - 1) {
        // DISPATCH DRAW WHEN PLAYERS PASS ONE AFTER ANOTHER
        this.phase = CONSTANTS.PHASE_END
        this.winner = CONSTANTS.BLANK
      }
    }
  }

  findCaptured(from, to) {
    let col = (to.col - from.col) / Math.abs(to.col - from.col)
    col += from.col
    let row = (to.row - from.row) / Math.abs(to.row - from.row)
    row += from.row
    return this.discs.filter(disc => disc.col === col && disc.row === row)[0]
  }

  nextTurn() {
    this.checkEndCondition()
    this.lastPassedTurn = this.wasThisTurnPassed 
      ? this.turnCount 
      : this.lastPassedTurn
    this.wasThisTurnPassed = false
    this.turnCount++
    this.turnColor = this.turnColor === CONSTANTS.RED 
      ? CONSTANTS.BLACK 
      : CONSTANTS.RED
    this.msg = ''
    this.hasCaptureChainStarted = false
    this.updateDiscActors()
    // this.updateUI()
    this.panel.update()
  }

  getActorType(disc) {
    const isEnticed = this.enticed.find(c => c === disc)
    const isCarefree = this.carefrees.find(m => m === disc)
    return isEnticed 
      ? 'enticed' 
      : isCarefree 
        ? 'carefree'
        : null
  }

  setupEventListeners() {
    const handlePointerStart = (e) => {
      this.ongoingTouches.push(this.copyTouch(e))
      
      const pushGrabbedDisc = (grabbedDisc, discs) => {
        discs = discs.filter(disc => disc !== grabbedDisc)
        discs.push(grabbedDisc)
        return discs
      }

      const clickedDisc = this.discs.find(disc =>
        disc.isClicked(this.pointerCoords.canvas.x, this.pointerCoords.canvas.y)
      )

      if (clickedDisc) {
        // Debug logging
        if (this.debugOverlay || this.debugMode) {
          if (this.debugDiscPositionMarker !== '') {
            console.log('------------', )
            console.log(`discCenterX,Y: ${clickedDisc.center.x} ${clickedDisc.center.y}`, )
            console.log(`clickedDisc.clickArea.${this.debugDiscPositionMarker}: ${clickedDisc.clickArea[this.debugDiscPositionMarker]}`, )
            console.log(`drawArea.${this.debugDiscPositionMarker}: ${clickedDisc.drawArea[this.debugDiscPositionMarker]}`, )
            console.log(`mouseCoord.canvas: ${this.pointerCoords.canvas.x} ${this.pointerCoords.canvas.y}`, )
            console.log('------------', )
          }
        }

        if (clickedDisc.color === this.turnColor) {
          const actor = this.getActorType(clickedDisc)
          if (actor === 'enticed') {
            clickedDisc.toggleGrab()
            this.discs = pushGrabbedDisc(clickedDisc, this.discs)
          } else if (actor === 'carefree') {
            if (this.enticed.length > 0) {
              this.msg = 'You must make a capture when available'
            } else {
              // TODO RFCT
              clickedDisc.toggleGrab()
              this.discs = pushGrabbedDisc(clickedDisc, this.discs)
            }
          } else {  // actor is null, neither carefree nor enticed
            this.msg = (this.enticed.length > 0 || this.carefrees.length > 0)
              ? 'This disc cannot move'
              : 'You have no moves available. Pass your turn'
          }
        } else {
          this.msg = 'That isn\'t your disc'
        }
      } else {
        this.play.playRandomClickSound()
      }
    // this.updateUI()
    this.panel.update()
    }

    const handlePointerMove = (e) => {
      // Scrolled window is not supported
      
      // Mouse coordinates relative to canvas
      this.pointerCoords.canvas.x = e.clientX - this.rect.left // + window.scrollX
      this.pointerCoords.canvas.y = e.clientY - this.rect.top // + window.scrollY

      // Mouse coordinates relative to play area
      this.pointerCoords.board.x = e.clientX - this.rect.left - this.playAreaOffset.x // + window.scrollX
      this.pointerCoords.board.y = e.clientY - this.rect.top - this.playAreaOffset.y // + window.scrollYA

      // Mouse coordinates relative to window
      this.pointerCoords.client.x = e.clientX // + window.scrollX
      this.pointerCoords.client.y = e.clientY // + window.scrollY
          
      // Calculate row,col from mouse coords
      this.pointerCoords.square.col = Math.floor((parseFloat((this.pointerCoords.board.x)/100,2).toFixed(2)))
      this.pointerCoords.square.row = Math.floor(parseFloat((this.pointerCoords.board.y)/100,2).toFixed(2))
    }

    const handlePointerEnd = (e) => {
      function isPointerInSquare(x, y, r, c) {
        // console.debug(`isMouseInSquarexy`, x, y)
        return (Math.floor(x/100) === c && Math.floor(y/100) === r)
      }
      console.log(`pointerup`, )
      const idx = this.ongoingTouchIndexById(e.pointerId)
      this.ongoingTouches.splice(idx, 1)
      

      // WARN may not copy disc.center.x|y
      //    if not, try structuredClone or parse/stringify
      // const grabbedDisc = JSON.parse(JSON.stringify(this.discs.find(disc => disc.isGrabbed)))
      // const grabbedDisc = Object.assign({}, this.discs.find(disc => disc.isGrabbed))
      const grabbedDisc = this.discs.find(disc => disc.isGrabbed)

      if (grabbedDisc) {
        const isEnticed = this.enticed.find(c => c === grabbedDisc) 
        const isCarefree = this.carefrees.find(m => m === grabbedDisc)

        // if is an enticed (can capture) and mouseupped on valid capture move
        if (isEnticed) {
          const captureMoves = this.findCaptureMoves(grabbedDisc)
          const validCaptureMove = captureMoves.find(move => 
            isPointerInSquare(this.pointerCoords.board.x, this.pointerCoords.board.y, move.row, move.col)
          )
          if (validCaptureMove) {
            // DISPATCH valid capture move
            const capturedDisc = this.capture(grabbedDisc, validCaptureMove)
            let deathSound
            if (capturedDisc.isKing) {
              this.sounds.king[1].currentTime = 0
              this.sounds.king[1].play()
            } else {
              deathSound = this.play.playRandomCaptureSound()
            }
            this.move(grabbedDisc, validCaptureMove, deathSound)
          } else {
            // DISPATCH not-valid-capture msg
            this.msg = 'Not a valid capture move'
          }
        } else if (isCarefree) {
          const nonCaptureMoves = this.findNonCaptureMoves(grabbedDisc)
          const nonCaptureMove = nonCaptureMoves.find(move =>
            isPointerInSquare(this.pointerCoords.board.x, this.pointerCoords.board.y, move.row, move.col)
          )
          if (nonCaptureMove) {
            // DISPATCH valid carefree move
            this.move(grabbedDisc, nonCaptureMove)
            this.play.playRandomMoveSound()
          } else {
            // DISPATCH invalid-mover-move msg
            this.msg = 'Invalid move. Try again'
          }
        }

        // DISPATCH
        grabbedDisc.toggleGrab()
        grabbedDisc.updateDiscGeometry()
      }
      // this.updateUI()
      this.panel.update()
    }

    const handlePointerCancel = (e) => {
      console.log(`pointercancel: id = ${e.pointerId}`, )
      const idx = this.ongoingTouchIndexById(e.pointerId)
      this.ongoingTouches.splice(idx, 1)
    }

    try {
      this.canvas.addEventListener('pointerdown', handlePointerStart, false)
      this.canvas.addEventListener('pointerup', handlePointerEnd, false)
      this.canvas.addEventListener('pointercancel', handlePointerCancel, false)
      this.canvas.addEventListener('pointermove', handlePointerMove, false)
      console.info('EventHandlers initialized')
    } catch (err) {
      console.error(`Game AddEventListeners Error: ${err}`)
    }
  }

  ongoingTouchIndexById(idToFind) {
    for (let i = 0; i < this.ongoingTouches.length; i++) {
      let id = this.ongoingTouches[i].identifier

      if (id == idToFind) {
        return i
      }
    }
    return -1
  }

  copyTouch(touch) {
    return { identifier: touch.pointerId, pageX: touch.clientX, pageY: touch.clientY }

  }

  toggleKings = () => {
    this.discs.forEach(disc => { disc.isKing = !disc.isKing })
  }

  end() {
    // Initiate end game phase
    
    if (this.winner === CONSTANTS.BLACK) {
      this.match.black++
    } else if (this.winner === CONSTANTS.RED) {
      this.match.red++
    }
    // Present modal view and "escape" options
    this.endDialog.show()
  }

  clr() {
    this.ctx.clearRect(
      this.baseThickness, 
      this.baseThickness, 
      this.canvas.width - 2 * this.baseThickness, 
      this.canvas.height - 2 * this.baseThickness
    )
  }

  drawBoard() {
    const darkHue = 18
    const lightHue = 45

    this.ctx.save()
    this.ctx.translate(this.playAreaOffset.x, this.playAreaOffset.y)

    for (let row = 0;row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        this.ctx.beginPath()
        if (( row + col) % 2 === 0) {
          this.ctx.fillStyle = `hsl(${lightHue}, 70%, 80%)`
          this.ctx.fillRect(col * 100, row * 100, 100, 100)
        } else {
          this.ctx.fillStyle = `hsl(${darkHue}, 25%, 30%)`
          this.ctx.fillRect(col * 100, row * 100, 100, 100)
        }
      }
    }
    this.ctx.restore()
  }


  drawDiscs() {
    this.discs.forEach(disc => {
      this.ctx.save()
      this.ctx.translate(this.playAreaOffset.x, this.playAreaOffset.y)
      disc.draw(this.pointerCoords.canvas.x, this.pointerCoords.canvas.y)
      this.ctx.restore()
    }
    )
  }

  drawBaseBoard() {
    // RFCT reference directly
    const origin = { x: 0, y: 0 }

    // Filler
    this.ctx.beginPath()
    this.ctx.fillStyle = 'hsla(28, 55%, 55%, 1)'
    // this.ctx.fillRect(origin.x, origin.y, this.boardWidth + 2 * this.baseThickness, this.boardHeight + 2 * this.baseThickness)

    this.ctx.strokeStyle = 'hsla(28, 55%, 55%, 1)'
    this.ctx.lineWidth = this.baseThickness
    this.ctx.lineCap = 'round'
    this.ctx.miterLimit = 1

    this.ctx.moveTo(origin.x + this.baseThickness/2, origin.y + this.baseThickness/2)
    this.ctx.lineTo(this.boardWidth + 1.5*this.baseThickness, origin.y + this.baseThickness/2)
    this.ctx.stroke()

    this.ctx.lineTo(this.boardWidth + 1.5*this.baseThickness, this.boardHeight + 1.5 * this.baseThickness)
    this.ctx.stroke()

    this.ctx.lineTo(origin.x + this.baseThickness/2,  this.boardHeight + 1.5 * this.baseThickness)
    this.ctx.stroke()

    this.ctx.lineTo(origin.x + this.baseThickness/2, origin.y + this.baseThickness/2)
    this.ctx.stroke()

    // Joints
    this.ctx.beginPath()
    this.ctx.strokeStyle = 'hsla(28, 55%, 40%,1)'
    this.ctx.lineWidth = 2
    this.ctx.moveTo(
      origin.x + 1 + this.baseThickness/2 - (this.baseThickness/2)/Math.sqrt(2), 
      origin.y + 1 + this.baseThickness/2 - (this.baseThickness/2)/Math.sqrt(2)
    )
    this.ctx.lineTo(
      this.boardWidth - 1 + 2 * this.baseThickness - this.baseThickness/2 + (this.baseThickness/2)/Math.sqrt(2), 
      this.boardHeight - 1 + 2 * this.baseThickness - this.baseThickness/2 + (this.baseThickness/2)/Math.sqrt(2)
    )
    this.ctx.moveTo(
      origin.x + 1 + this.baseThickness/2 - (this.baseThickness/2)/Math.sqrt(2), 
      origin.y - 1 + this.boardHeight + 1.5 * this.baseThickness + (this.baseThickness/2)/Math.sqrt(2)
    )
    this.ctx.lineTo(
      origin.x - 1 + this.boardWidth + 1.5 * this.baseThickness + (this.baseThickness/2)/Math.sqrt(2), 
      origin.y + 1 + this.baseThickness/2 - (this.baseThickness/2)/Math.sqrt(2)
    )
    this.ctx.stroke()
  }

  drawAll() {
    // this.drawBaseBoard()
    this.drawBoard()
    this.drawDiscs()

    if (this.debugOverlay) {
      this.discs.forEach(d => {
        this.ctx.save()
        this.ctx.translate(this.playAreaOffset.x, this.playAreaOffset.y)
        d.drawClickArea(this.debugDiscPositionMarker)
        this.ctx.restore()
      })
      this.canvas.style.border = '1px solid red'
    } else {
      this.canvas.style.border = 'none'
    }
  }
}