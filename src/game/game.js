import Disc from './Disc'
import { CONSTANTS, } from './main'
import Panel from './Panel'
import EndDialog from './EndDialog'

export default class Game {
  constructor (match, ui, debugMode=false, debugOverlay=false) {
    this.debugMode = debugMode
    this.debugOverlay = debugOverlay
    this.debugDiscPositionMarker = ''

    this.match = match

    this.ui = ui
    this.ctx = this.ui.canvas.getContext('2d')

    this.board = this.debugMode
      ? [ 
          [0,0,0,0,0,0,0,0],
          [1,0,0,0,2,0,2,0],
          [0,2,0,0,0,0,0,0],
          [2,0,0,0,2,0,0,0],
          [0,0,0,0,0,1,0,1],
          [0,0,0,0,1,0,0,0],
          [0,1,0,0,0,1,0,2],
          [0,0,0,0,0,0,0,0]
        ]
      : [ 
          [0,2,0,2,0,2,0,2],
          [2,0,2,0,2,0,2,0],
          [0,2,0,2,0,2,0,2],
          [0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0],
          [1,0,1,0,1,0,1,0],
          [0,1,0,1,0,1,0,1],
          [1,0,1,0,1,0,1,0],
        ]

    this.discs = []
    
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
    this.turnCount = 0
    this.turnColor = CONSTANTS.BLACK
    this.phase = CONSTANTS.PHASE_PLAY    // new, playing, end
    this.winner = ''
    this.captures = {
      capturedBlacks: [],
      capturedReds: [],
    }
    this.hasCaptureChainStarted = false
    
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

    this.boardPanelGap = 15

    this.endDialog = new EndDialog(this)

    const panelOffset = {
      x: this.boardWidth + 2 * this.baseThickness + this.boardPanelGap,
      y: 0
    }
    const panelDims = {
      w: 200,
      h: this.boardHeight + 2 * this.baseThickness
    }
    this.panel = new Panel(
      panelOffset,
      panelDims,
      this
    )

    this.ui.canvas.width = this.boardWidth + 2 * this.baseThickness
      + this.boardPanelGap + panelDims.w
    this.ui.canvas.height = this.boardHeight + 2 * this.baseThickness
    // this.ui.canvas.style.border = '1px solid red'

    this.rect = this.ui.canvas.getBoundingClientRect()

    this.ghostSourceDisc = null


    this.initDiscs()
    this.updateDiscActors()
    this.setupEventListeners()
  }

  passTurn(playerColor) {
    return () => {
      if (this.turnColor === playerColor) {
        this.nextTurn()
      }
    }
  }

  initDiscs() {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        switch(this.board[i][j]) {
          case CONSTANTS.RED:
            this.discs.push(
              new Disc(this.ctx, i, j, this.playAreaOffset, CONSTANTS.RED)
            )
            break
          case CONSTANTS.BLACK:
            this.discs.push(
              new Disc(this.ctx, i, j, this.playAreaOffset, CONSTANTS.BLACK)
            )
            break
          case CONSTANTS.BLANK:
            break
          default:
            console.log('unhandled board object render')
            this.ui.debug.innerText += 'error rendering board object'
        }
      }
    }
    if (this.debugMode) {
      for (let i = 0; i < 11; i++) {
      this.captures.capturedBlacks.push(new Disc(this.ctx,9,9,this.playAreaOffset,CONSTANTS.BLACK))
      this.captures.capturedReds.push(new Disc(this.ctx,9,9,this.playAreaOffset,CONSTANTS.RED))
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
      // CSDR somehow binding board to this.board of Game
      if (disc.row + (2*disc.direction * direction) >= 0 &&
          disc.row + (2*disc.direction * direction) < 8) {
        if ((board[disc.row + disc.direction * direction][disc.col - 1] === disc.opposite) && 
          (board[disc.row + (2*disc.direction * direction)][disc.col - 2] === 0)) {
            captureMoves.push({ row: disc.row + (2*disc.direction * direction), col: disc.col - 2 })
        }
        if ((board[disc.row + disc.direction  * direction][disc.col + 1] === disc.opposite) &&
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

  move(grabbedDisc, to) {
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
      this.nextTurn()
    } else if (this.hasCaptureChainStarted && this.enticed.length === 0) {
      // DISPATCH
      this.nextTurn()
    } else if (!this.hasCaptureChainStarted) {
      this.nextTurn()
    }
  }
  
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

    this.checkVictory()

    this.hasCaptureChainStarted = true
  }

  checkVictory() {
    if (this.enticed === 0 && this.carefrees === 0) {
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
    this.turnCount++
    this.turnColor = this.turnColor === CONSTANTS.RED 
      ? CONSTANTS.BLACK 
      : CONSTANTS.RED
    this.msg = ''
    this.hasCaptureChainStarted = false
    this.updateDiscActors()
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
    const handleMouseMove = (e) => {
      // Scrolled window is not supported
      
      // Mouse coordinates relative to canvas
      this.mouseCoords.canvas.x = e.clientX - this.rect.left // + window.scrollX
      this.mouseCoords.canvas.y = e.clientY - this.rect.top // + window.scrollY

      // Mouse coordinates relative to play area
      this.mouseCoords.board.x = e.clientX - this.rect.left - this.playAreaOffset.x // + window.scrollX
      this.mouseCoords.board.y = e.clientY - this.rect.top - this.playAreaOffset.y // + window.scrollY

      // Mouse coordinates relative to window
      this.mouseCoords.client.x = e.clientX // + window.scrollX
      this.mouseCoords.client.y = e.clientY // + window.scrollY
          
      // Calculate row,col from mouse coords
      this.mouseCoords.square.col = Math.floor((parseFloat((this.mouseCoords.board.x)/100,2).toFixed(2)))
      this.mouseCoords.square.row = Math.floor(parseFloat((this.mouseCoords.board.y)/100,2).toFixed(2))
    }

    const handleMouseDown = () => {
      const pushGrabbedDisc = (grabbedDisc, discs) => {
        discs = discs.filter(disc => disc !== grabbedDisc)
        discs.push(grabbedDisc)
        return discs
      }

      const clickedDisc = this.discs.find(disc =>
        disc.isClicked(this.mouseCoords.canvas.x, this.mouseCoords.canvas.y)
      )

      if (clickedDisc) {
        // Debug logging
        if (this.debugOverlay || this.debugMode) {
          if (this.debugDiscPositionMarker !== '') {
            // console.log(`Clicked Disc ${clickedDisc.id}`)
            console.log('------------', )
            console.log(`discCenterX,Y: ${clickedDisc.center.x} ${clickedDisc.center.y}`, )
            console.log(`clickedDisc.clickArea.${this.debugDiscPositionMarker}: ${clickedDisc.clickArea[this.debugDiscPositionMarker]}`, )
            console.log(`drawArea.${this.debugDiscPositionMarker}: ${clickedDisc.drawArea[this.debugDiscPositionMarker]}`, )
            console.log(`mouseCoord.canvas: ${this.mouseCoords.canvas.x} ${this.mouseCoords.canvas.y}`, )
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
              // RFCT
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
      }
    }

    const handleMouseUp = () => {

      function isMouseInSquare(x, y, r, c) {
        // console.debug(`isMouseInSquarexy`, x, y)
        return (Math.floor(x/100) === c && Math.floor(y/100) === r)
      }

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
            isMouseInSquare(this.mouseCoords.board.x, this.mouseCoords.board.y, move.row, move.col)
          )
          if (validCaptureMove) {
            // DISPATCH valid capture move
            this.capture(grabbedDisc, validCaptureMove)
            this.move(grabbedDisc, validCaptureMove)
          } else {
            // DISPATCH not-valid-capture msg
            this.msg = 'Not a valid capture move'
          }
        } else if (isCarefree) {
          const nonCaptureMoves = this.findNonCaptureMoves(grabbedDisc)
          const nonCaptureMove = nonCaptureMoves.find(move =>
            isMouseInSquare(this.mouseCoords.board.x, this.mouseCoords.board.y, move.row, move.col)
          )
          if (nonCaptureMove) {
            // DISPATCH valid mover move
            this.move(grabbedDisc, nonCaptureMove)
            // DISPATCH nextTurn
          } else {
            // DISPATCH invalid-mover-move msg
            this.msg = 'Invalid move. Try again'
          }
        }

        // DISPATCH
        grabbedDisc.toggleGrab()
        grabbedDisc.updateDiscGeometry()
      }


    }
    document.addEventListener('mousemove', handleMouseMove)
    this.ui.canvas.addEventListener('mousedown', handleMouseDown) 
    this.ui.canvas.addEventListener('mouseup', handleMouseUp) 
  }

  toggleKings = () => {
    this.discs.forEach(disc => { disc.isKing = !disc.isKing })
  }

  end() {
    // Initiate end game phase
    
    // Process data
    if (this.winner === CONSTANTS.BLACK) {
      this.match.black++
    } else {
      this.match.red++
    }
    // console.log(`IN endGame, match post-inc`, this.match )
    // console.log(`IN endGame, game.winner`, this.winner)
    
    // Present modal view and "escape" options
    this.endDialog.show()
  }

  clr() {
    this.ctx.clearRect(0, 0, this.ui.canvas.width, this.ui.canvas.height)
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
          this.ctx.fillStyle = `hsl(${lightHue}, 70%, 72%)`
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
    this.discs.forEach(disc => disc
      .draw(this.mouseCoords.canvas.x, this.mouseCoords.canvas.y)
    )
  }


  drawBaseBoard() {
    // RFCT reference directly
    const origin = { x: 0, y: 0 }
    this.ctx.beginPath()

    // Filler
    this.ctx.fillStyle = 'hsla(28, 55%, 55%, 1)'
    this.ctx.fillRect(origin.x, origin.y, this.boardWidth + 2 * this.baseThickness, this.boardHeight + 2 * this.baseThickness)

    // Joints
    this.ctx.strokeStyle = 'black'
    this.ctx.moveTo(origin.x, origin.y)
    this.ctx.lineTo(this.boardWidth + 2 * this.baseThickness, this.boardHeight + 2 * this.baseThickness)
    this.ctx.moveTo(origin.x, origin.y + this.boardHeight + 2 * this.baseThickness)
    this.ctx.lineTo(origin.x + this.boardWidth + 2 * this.baseThickness, origin.y)
    this.ctx.stroke()
  }

  drawAll() {
    this.drawBaseBoard()
    this.drawBoard()
    this.drawDiscs()
    this.panel.draw(
      { captures: this.captures, turnColor: this.turnColor }
    )

    if (this.debugOverlay) {
      this.discs.forEach(d => d.drawClickArea(this.debugDiscPositionMarker))
    }
  }
}