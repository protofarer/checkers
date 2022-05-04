import Disc from './disc';
import { CONSTANTS, resetGame } from '../main';
import Panel from './panel';

export default class Game {
  constructor (ui, debugMode=false) {
    this.debugMode = debugMode;
    this.ui = ui;
    this.board = this.debugMode
      ? [ 
          [0,0,0,0,0,0,0,0],
          [0,0,2,0,0,0,0,0],
          [0,2,0,2,0,0,0,0],
          [2,0,0,0,0,0,0,0],
          [0,0,0,0,0,1,0,1],
          [0,0,0,0,1,0,0,0],
          [0,0,0,0,0,1,0,0],
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
    this.discs = [];
    this.movers = {};
    this.captors = {};
    this.msg = "";
    this.turnCount = 0;
    this.turnColor = CONSTANTS.BLACK;
    this.grabbedDisc = {
      disc: null,
      type: null,
    };
    this.hasCaptureChainStarted = false;
    this.mouseCoords = { 
      canvasX: 0, canvasY: 0, 
      boardX: 0, boardY: 0,
      cX: 0, cY: 0 
    };
    this.phase = CONSTANTS.PHASE_PLAY;    // new, playing, end
    this.winner = "";

    this.captures = {
      forRed: 0,
      forBlack: 0,
    };

    // this.match = {
    //   count: 0,
    //   red: {
    //     wins: 0
    //   },
    //   black: {
    //     wins: 0
    //   }
    // }

    this.ctx = this.ui.canvas.getContext('2d');
    
    this.boardHeight = 800;
    this.boardWidth = 800;
    this.baseThickness = 75;      // decorative graphic around board
    
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

    this.boardPanelGap = 15;

    const panelOffsetX = this.boardWidth + 2 * this.baseThickness + this.boardPanelGap
    const panelOffsetY = 0;
    const panelWidth = 200;
    const panelHeight = this.boardHeight + 2 * this.baseThickness
    this.panel = new Panel(
      panelOffsetX, panelOffsetY,
      panelWidth, panelHeight,
      this.ctx
    )
    
    this.ui.canvas.width = this.boardWidth + 2 * this.baseThickness
      + this.boardPanelGap + panelWidth;
    this.ui.canvas.height = this.boardHeight + 2 * this.baseThickness;
    this.ui.canvas.style.border = '1px solid red'

    this.rect = this.ui.canvas.getBoundingClientRect();

    this.initDiscs();
    this.updateDiscActors();
    this.setupEventListeners();
  }

  initDiscs() {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        switch(this.board[i][j]) {
          case CONSTANTS.RED:
            this.discs.push(new Disc(this.ctx, i, j, this.playAreaOffset, CONSTANTS.RED));
            break;
          case CONSTANTS.BLACK:
            this.discs.push(new Disc(this.ctx, i, j, this.playAreaOffset, CONSTANTS.BLACK));
            break;
          case CONSTANTS.BLANK:
            break;
          default:
            console.log('unhandled board object render');
            debug.innerText += 'error rendering board object';
        }
      }
    }
  }

  boardToHTML() {
    let s = '';
    for (let r of this.board) {
      s += `${r.join(' ')}<br />`;
    }
    return s;
  }

  findNonCaptureMoves(disc) {
    let nonCaptureMoves = [];
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
    return nonCaptureMoves;
  }

  findCaptureMoves(disc) {
    let captureMoves = [];
    captureByDirection(1, this.board);
    if (disc.isKing) {
      captureByDirection(-1, this.board);
    }
    function captureByDirection(direction, board) {
      // CSDR somehow binding board to this.board of Game
      if (disc.row + (2*disc.direction * direction) >= 0 &&
          disc.row + (2*disc.direction * direction) < 8) {
        if ((board[disc.row + disc.direction * direction][disc.col - 1] === disc.opposite) && 
          (board[disc.row + (2*disc.direction * direction)][disc.col - 2] === 0)) {
            captureMoves.push({ row: disc.row + (2*disc.direction * direction), col: disc.col - 2 });
        }
        if ((board[disc.row + disc.direction * direction * direction][disc.col + 1] === disc.opposite) &&
          (board[disc.row + (2*disc.direction * direction)][disc.col + 2] === 0)) {
            captureMoves.push({ row: disc.row + (2*disc.direction * direction), col: disc.col + 2 });
        }
      }
    }
    // if (disc.isKing) {
    //   if (disc.row - (2*disc.direction) >= 0 &&
    //       disc.row - (2*disc.direction) < 8) {
    //     if ((this.board[disc.row - disc.direction][disc.col - 1] === disc.opposite) && 
    //       (this.board[disc.row - (2*disc.direction)][disc.col - 2] === 0)) {
    //         captureMoves.push({ row: disc.row - (2*disc.direction), col: disc.col - 2 });
    //     }
    //     if ((this.board[disc.row - disc.direction][disc.col + 1] === disc.opposite) &&
    //       (this.board[disc.row - (2*disc.direction)][disc.col + 2] === 0)) {
    //         captureMoves.push({ row: disc.row - (2*disc.direction), col: disc.col + 2 });
    //     }
    //   }
    // }
    return captureMoves;
  }

  updateDiscActors() {
    this.movers = this.findPotentialMovers();
    this.captors = this.findPotentialCaptors();
  }

  // WARNING till function from disc class called
  findPotentialCaptors() {
    const potentialCaptors = this.discs.filter(disc => 
      this.findCaptureMoves(disc).length > 0 && disc.color === this.turnColor
    );
    return potentialCaptors;
  }
  findPotentialMovers() {
    const potentialMovers = this.discs.filter(disc =>
      this.findNonCaptureMoves(disc).length > 0 && disc.color === this.turnColor);
    return potentialMovers;
  }
  move(grabbedDisc, to) {
    this.board[grabbedDisc.row][grabbedDisc.col] = 0;
    this.board[to.row][to.col] = grabbedDisc.color;
    grabbedDisc.row = to.row;
    grabbedDisc.col = to.col;
    if (grabbedDisc.row === 0 || grabbedDisc.row === 7) {
      grabbedDisc.direction *= -1;
    }
    this.updateDiscActors();
  }
  capture(grabbedDisc, to) {
    const capturedDisc = this.findCaptured(grabbedDisc, to);
    if (capturedDisc.color === CONSTANTS.RED) {
      this.captures.forBlack += 1;
    } else {
      this.captures.forRed += 1;
    }
    this.board[capturedDisc.row][capturedDisc.col] = 0;
    this.discs = this.discs.filter(disc => 
      !(disc.row === capturedDisc.row && disc.col === capturedDisc.col)
    );
    this.hasCaptureChainStarted = true;

  }
  findCaptured(from, to) {
    let col = (to.col - from.col) / Math.abs(to.col - from.col);
    col += from.col;
    let row = (to.row - from.row) / Math.abs(to.row - from.row);
    row += from.row;
    return this.discs.filter(disc => disc.col === col && disc.row === row)[0];
  }
  nextTurn() {
    this.turnCount++;
    this.turnColor = this.turnColor === CONSTANTS.RED 
      ? CONSTANTS.BLACK 
      : CONSTANTS.RED;
    this.msg = "";
    this.hasCaptureChainStarted = false;
    this.updateDiscActors();
  }

  setupEventListeners() {
    document.addEventListener('mousemove', handleMouseMove.bind(this));
    this.ui.canvas.addEventListener('mousedown', handleMouseDown.bind(this)); 
    this.ui.canvas.addEventListener('mouseup', handleMouseUp.bind(this)); 
    this.ui.debugButton.addEventListener('click', handleDebugClick.bind(this));
    this.ui.kingButton.addEventListener('click', handleDebugKing.bind(this));
    this.ui.victoryButton.addEventListener('click', handleDebugVictory.bind(this));

    function handleDebugVictory() {
      this.phase = CONSTANTS.PHASE_END;
      this.winner = this.winner === CONSTANTS.RED ? CONSTANTS.BLACK : CONSTANTS.RED;
    }

    function handleMouseMove(e) {
      // Mouse coordinates relative to canvas
      this.mouseCoords.canvasX = e.clientX - this.rect.left; //window.scrollX
      this.mouseCoords.canvasY = e.clientY - this.rect.top;

      // Mouse coordinates relative to play area
      this.mouseCoords.boardX = e.clientX - this.rect.left - this.playAreaOffset.x
      this.mouseCoords.boardY = e.clientY - this.rect.top - this.playAreaOffset.y

      // Mouse coordinates relative to window
      this.mouseCoords.cX = e.clientX;
      this.mouseCoords.cY = e.clientY;
    }

    function handleMouseDown(e) {
      const clickedDisc = this.discs.find(disc =>
        disc.isClicked(this.mouseCoords.canvasX, this.mouseCoords.canvasY)
      );
      console.log(`a disc was clicked`, clickedDisc)
      

      if (clickedDisc) {
        if (clickedDisc.color === this.turnColor) {
          const isCaptor = this.captors.find(c => c === clickedDisc);
          const isMover = this.movers.find(m => m === clickedDisc);
          if (this.captors.length > 0) {
            if (isCaptor) {
              // DISPATCH successful grab of a captor
              clickedDisc.toggleGrab();
              this.grabbedDisc.disc = clickedDisc;
              this.grabbedDisc.type = "captor";
              console.log(`a captor was grabbed`, )
              
            } else if (isMover) {
              // DISPATCH must-capture msg
              this.msg = "You must capture when possible.";
            }
          } else if (this.movers.length > 0) {
            if (isMover) {
              // DISPATCH successful grab of a mover
              clickedDisc.toggleGrab();
              this.grabbedDisc.disc = clickedDisc;
              this.grabbedDisc.type = "mover";
              console.log(`a mover was grabbed`)
            } else if (this.movers.length === 0 && this.captors.length === 0) {
              // DISPATCH no-moves-avail msg
              this.msg = "You have no moves available! Press pass to turn control to other player";
            } else {
              // WARN this may be unreachable block
              // DISPATCH cannot-move-this-disc msg
              this.msg = "This disc cannot move!";
            }
          }
          if (!isMover && !isCaptor) {
            // DISPATCH no-moves-disc msg
            this.msg = "This disc has no moves available";
          }
        } else if (clickedDisc.color !== this.turnColor) {
          // DISPATCH not-your-disc msg
          this.msg = "That isn't your disc!";
        }
      } 

      const isResetClicked = this.panel.isResetClicked(this.mouseCoords.canvasX, this.mouseCoords.canvasY);
      if (isResetClicked) {
        // DISPATCH resetGame
        resetGame();
      }

      const isRedPassClicked = this.panel.isRedPassClicked(this.mouseCoords.canvasX, this.mouseCoords.canvasY);
      if (isRedPassClicked && this.turnColor === CONSTANTS.RED) {
        // DISPATCH nextTurn
        this.nextTurn();
      }
      const isBlackPassClicked = this.panel.isBlackPassClicked(this.mouseCoords.canvasX, this.mouseCoords.canvasY);
      if (isBlackPassClicked && this.turnColor === CONSTANTS.BLACK) {
        // DISPATCH nextTurn
        this.nextTurn();
      }
    }

    function handleMouseUp(e) {

      function isMouseInSquare(x, y, r, c) {
        // console.debug(`isMouseInSquarexy`, x, y)
        return (Math.floor(x/100) === c && Math.floor(y/100) === r)
      }

      if (this.grabbedDisc.disc !== null && this.grabbedDisc.disc !== undefined) {
        console.log(`grabbedDisc exists, in mouseup`, this.grabbedDisc.disc)
        
        const isCaptor = this.captors.find(c => c === this.grabbedDisc.disc); 
        const isMover = this.movers.find(m => m === this.grabbedDisc.disc);
        
        // if is a captor and mouseupped on valid capture move
        if (isCaptor) {
          const captureMoves = this.findCaptureMoves(this.grabbedDisc.disc);
          const validCaptureMove = captureMoves.find(move => 
            isMouseInSquare(this.mouseCoords.boardX, this.mouseCoords.boardY, move.row, move.col)
          );
          if (validCaptureMove) {
            // DISPATCH valid capture move
            this.capture(this.grabbedDisc.disc, validCaptureMove);
            this.move(this.grabbedDisc.disc, validCaptureMove);
            this.grabbedDisc.disc?.setClickArea()
          } else {
            // DISPATCH not-valid-capture msg
            this.msg = "Not a valid capture move";
          }
        } else if (isMover) {
          const nonCaptureMoves = this.findNonCaptureMoves(this.grabbedDisc.disc);
          const nonCaptureMove = nonCaptureMoves.find(move =>
            isMouseInSquare(this.mouseCoords.boardX, this.mouseCoords.boardY, move.row, move.col)
          );
          if (nonCaptureMove) {
            // DISPATCH valid mover move
            this.move(this.grabbedDisc.disc, nonCaptureMove);
            this.grabbedDisc.disc?.setClickArea()
            this.nextTurn();
          } else {
            // DISPATCH invalid-mover-move msg
            this.msg = "Invalid move. Try again"
          }
        }
        if (this.hasCaptureChainStarted && this.captors.length === 0) {
          // DISPATCH nextTurn
          this.nextTurn();
        }
        if ((this.grabbedDisc.disc.row === 0 && this.grabbedDisc.disc.color === CONSTANTS.BLACK)
        || (this.grabbedDisc.disc.row === 7 && this.grabbedDisc.disc.color === CONSTANTS.RED)) {
          // DISPATCH makeKing
          this.grabbedDisc.disc.isKing = true;
        }
        // DISPATCH drop disc
        // TODO move sertclickarea call after disc actually moves
        this.grabbedDisc.disc?.toggleGrab();
        // TODO remove reference to disc without making it null
        // this.grabbedDisc = {}
      }
      

      if (this.discs.filter(d => d.color === CONSTANTS.RED).length === 0) {
        this.phase = CONSTANTS.PHASE_END;
        this.winner = CONSTANTS.BLACK;

        // DISPATCH RED WINS
        // TODO show win dialog
        //    add point to winner
        //    exclamation
        //    show new game button
        //    reset game
      } else if (this.discs.filter(d => d.color === CONSTANTS.BLACK).length === 0 ) {
        this.phase = CONSTANTS.PHASE_END;
        this.winner = CONSTANTS.RED;
        // DISPATCH BLACK WINS
      }
    }

    function handleDebugClick() {
      this.debugMode = !this.debugMode;
      if (this.debugMode) {
        debugButton.innerText = 'turn\ndebug\noff';
        this.ui.debugEle.style.display = 'block';
        this.ui.boardStateEle.style.display = 'block';
        this.ui.resetButton.style.display = 'block';
        this.ui.debugResetButton.style.display = 'block';
        this.ui.kingButton.style.display = 'block';
      } else {
        debugButton.innerText =  'turn\ndebug\non';
        this.ui.debugEle.style.display = 'none';
        this.ui.boardStateEle.style.display = 'none';
        this.ui.resetButton.style.display = 'none';
        this.ui.debugResetButton.style.display = 'none';
        this.ui.kingButton.style.display = 'none';
      }
    }

    function handleDebugKing() {
      this.discs.forEach(disc => { disc.isKing = !disc.isKing });
    }
  }

  clr() {
    this.ctx.clearRect(0, 0, this.ui.canvas.width, this.ui.canvas.height);
  }

  drawBoard() {
    const darkHue = 18;
    const lightHue = 45;
    this.ctx.save();
    this.ctx.translate(this.playAreaOffset.x, this.playAreaOffset.y)
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        this.ctx.beginPath();
        if (( row + col) % 2 === 0) {
          this.ctx.fillStyle = `hsl(${lightHue}, 70%, 72%)`;
          this.ctx.fillRect(col * 100, row * 100, 100, 100);
        } else {
          // this.ctx.shadowColor = 'black';
          // this.ctx.shadowBlur = 45;
          // this.ctx.shadowOffsetY = 20;
          this.ctx.fillStyle = `hsl(${darkHue}, 25%, 30%)`;
          this.ctx.fillRect(col * 100, row * 100, 100, 100);
          // this.ctx.shadowColor = this.ctx.shadowBlur = this.ctx.shadowOffsetY = null
        }
      }
    }
    this.ctx.restore();
  }

  drawPossibleMoves() {
    // When disc is grabbed, show available moves
    // RFCT
    if (this.grabbedDisc.disc) {
      if (this.grabbedDisc.type === 'captor') {
        const captureMoves = this.findCaptureMoves(this.grabbedDisc.disc); 
        for (let m of captureMoves) {
          const ghostDisc = new Disc(this.ctx, m.row, m.col, this.playAreaOffset, CONSTANTS.GHOST)
          ghostDisc.draw(this.mouseCoords.canvasX, this.mouseCoords.canvasY);
        }
      } else if (this.grabbedDisc.type === 'mover') {
        const nonCaptureMoves = this.findNonCaptureMoves(this.grabbedDisc.disc, this.playAreaOffset);
        for (let m of nonCaptureMoves) {
          const ghostDisc = new Disc(this.ctx, m.row, m.col, this.playAreaOffset, CONSTANTS.GHOST)
          ghostDisc.draw(this.mouseCoords.canvasX, this.mouseCoords.canvasY);
        }
      }
    }
  }

  drawDiscs() {
    for (let disc of this.discs) {
      disc.draw(this.mouseCoords.canvasX, this.mouseCoords.canvasY);
    }
  }

  drawVictoryDialog() {
    this.ctx.beginPath()
    this.ctx.fillStyle = 'hsla(0, 0%, 95%, 0.75)'
    this.ctx.fillRect(100, 200, 600, 400);

    this.ctx.fillStyle = this.winner === CONSTANTS.RED 
      ? 'crimson'
      : 'black';
    this.ctx.font = 'bold 60px Arial';
    this.ctx.fillText(
      `${this.winner === CONSTANTS.RED ? 'RED' : 'BLACK'}`,
      300, 350
    )
    this.ctx.fillStyle = 'green'
    this.ctx.fillText(
      'WINS!',
      300, 425)
  }

  drawBaseBoard() {
    const origin = { x: 5, y: 5 }

    this.ctx.beginPath()

    // Filler
    this.ctx.fillStyle = 'hsla(27, 48%, 47%, 1)'
    this.ctx.fillRect(origin.x, origin.y, this.boardWidth + 2 * this.baseThickness - 10, this.boardHeight + 2 * this.baseThickness - 10)

    // Joints
    this.ctx.strokeStyle = 'black'
    this.ctx.moveTo(origin.x, origin.y)
    this.ctx.lineTo(this.boardWidth + 2 * this.baseThickness - 10, this.boardHeight + 2 * this.baseThickness - 10)
    this.ctx.moveTo(origin.x, origin.y + this.boardHeight + 2 * this.baseThickness - 10)
    this.ctx.lineTo(origin.x + this.boardWidth + 2 * this.baseThickness - 10, origin.y)
    this.ctx.stroke()
    

  }

  drawAll() {
    this.drawBaseBoard()
    this.drawBoard();
    this.drawDiscs();
    this.panel.draw({ captures: this.captures, turnColor: this.turnColor });
    // this.drawPossibleMoves();

    this.phase === CONSTANTS.PHASE_END && this.drawVictoryDialog();
  }
}