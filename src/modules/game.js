import Disc from './disc';
import { CONSTANTS, resetGame } from '../main';
import Panel from './panel';

export default class Game {
  constructor (ui, debugMode=false) {
    this.ui = ui;
    this.board = debugMode
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
    this.captures = {
      forRed: 0,
      forBlack: 0,
    };
    this.grabbedDisc = {
      disc: null,
      type: null,
    };
    this.hasCaptureChainStarted = false;
    this.debug = true;
    this.mouseCoords = { mouseX: 0, mouseY: 0, cX: 0, cY: 0 };

    this.initDiscs();
    this.updateDiscActors();

    this.ctx = this.ui.canvas.getContext('2d');
    
    this.boardHeight = 800;
    this.boardWidth = 800;
    this.panelWidth = 200;
    this.panelHeight = this.boardHeight;
    this.ui.canvas.width = this.boardWidth + this.panelWidth + 15;
    this.ui.canvas.height = this.boardHeight;
    this.rect = this.ui.canvas.getBoundingClientRect();

    this.panel = new Panel(this.panelWidth, this.panelHeight, this.ctx)

    this.setupEventListeners();
  }

  initDiscs() {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        switch(this.board[i][j]) {
          case CONSTANTS.RED:
            this.discs.push(new Disc(i, j, CONSTANTS.RED));
            break;
          case CONSTANTS.BLACK:
            this.discs.push(new Disc(i, j, CONSTANTS.BLACK));
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
    this.movers = this.findPotentialMovers(this.discs);
    this.captors = this.findPotentialCaptors(this.discs);
  }
  // WARNING till function from disc class called
  findPotentialCaptors(discs) {
    const potentialCaptors = discs.filter(disc => 
      this.findCaptureMoves(disc).length > 0 && disc.color === this.turnColor
    );
    return potentialCaptors;
  }
  findPotentialMovers(discs) {
    const potentialMovers = discs.filter(disc =>
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
  this.ui.debugButton.addEventListener('click', toggleDebug.bind(this));

  function handleMouseMove(e) {
    this.mouseCoords.mouseX = e.clientX - this.rect.left; //window.scrollX
    this.mouseCoords.mouseY = e.clientY - this.rect.top;
    this.mouseCoords.cX = e.clientX;
    this.mouseCoords.cY = e.clientY;
  }

  function handleMouseDown(e) {
    const clickedDisc = this.discs.find(disc =>
      disc.isClicked(this.ctx, this.mouseCoords.mouseX, this.mouseCoords.mouseY));

    if (clickedDisc) {
      if (clickedDisc.color === this.turnColor) {
        const isCaptor = this.captors.find(c => c === clickedDisc);
        const isMover = this.movers.find(m => m === clickedDisc);
        if (this.captors.length > 0) {
          if (isCaptor) {
            clickedDisc.toggleGrab();
            this.grabbedDisc.disc = clickedDisc;
            this.grabbedDisc.type = "captor";
          } else if (isMover) {
            this.msg = "You must capture when possible.";
          }
        } else if (this.movers.length > 0) {
          if (isMover) {
            clickedDisc.toggleGrab();
            this.grabbedDisc.disc = clickedDisc;
            this.grabbedDisc.type = "mover";
          } else if (this.movers.length === 0 && this.captors.length === 0) {
            this.msg = "You have no moves available! Press pass to turn control to other player";
          } else {
            this.msg = "This disc cannot move!";
          }
        }
        if (!isMover && !isCaptor) {
          this.msg = "This disc has no moves available";
        }
      } else if (clickedDisc.color !== this.turnColor) {
        this.msg = "That isn't your disc!";
      }
    } 

    const isResetClicked = this.panel.isResetClicked(this.mouseCoords.mouseX, this.mouseCoords.mouseY);
    if (isResetClicked) {
      resetGame();
    }

    const isRedPassClicked = this.panel.isRedPassClicked(this.mouseCoords.mouseX, this.mouseCoords.mouseY);
    if (isRedPassClicked && this.turnColor === CONSTANTS.RED) {
      this.nextTurn();
    }
    const isBlackPassClicked = this.panel.isBlackPassClicked(this.mouseCoords.mouseX, this.mouseCoords.mouseY);
    if (isBlackPassClicked && this.turnColor === CONSTANTS.BLACK) {
      this.nextTurn();
    }
  }

  function handleMouseUp(e) {
    // CSDR moving grabbedDisc to this
    const grabbedDisc = this.grabbedDisc.disc;
    if (grabbedDisc) {
      const isCaptor = this.captors.find(c => c === grabbedDisc); 
      const isMover = this.movers.find(m => m === grabbedDisc);
      
      // if is a captor and mouseupped on valid capture move
      if (isCaptor) {
        const captureMoves = this.findCaptureMoves(grabbedDisc);
        const validCaptureMove = captureMoves.find(move => 
          isMouseInSquare(this.mouseCoords.mouseX, this.mouseCoords.mouseY, move.row, move.col)
        );
        if (validCaptureMove) {
          this.capture(grabbedDisc, validCaptureMove);
          this.move(grabbedDisc, validCaptureMove);
        } else {
          this.msg = "Not a valid capture move";
        }
      } else if (isMover) {
        const nonCaptureMoves = this.findNonCaptureMoves(grabbedDisc);
        const nonCaptureMove = nonCaptureMoves.find(move =>
          isMouseInSquare(this.mouseCoords.mouseX, this.mouseCoords.mouseY, move.row, move.col)
        );
        if (nonCaptureMove) {
          this.move(grabbedDisc, nonCaptureMove);
          this.nextTurn();
        } else {
          this.msg = "Invalid move. Try again"
        }
      }
      if (this.hasCaptureChainStarted && this.captors.length === 0) {
        this.nextTurn();
      }
      if ((grabbedDisc.row === 0 && grabbedDisc.color === CONSTANTS.BLACK)
      || (grabbedDisc.row === 7 && grabbedDisc.color === CONSTANTS.RED)) {
        grabbedDisc.isKing = true;
      }
    }
    grabbedDisc?.toggleGrab();
    this.grabbedDisc.disc = null;
    this.grabbedDisc.type = null;
    
    function isMouseInSquare(x, y, r, c) {
      return (Math.floor(x/100) === c && Math.floor(y/100) === r)
    }
  }

  function toggleDebug(e) {
    this.debug = !this.debug;
    this.ui.debugButton.innerText = this.debug 
      ? 'turn\ndebugMode\noff' 
      : 'turn\ndebugMode\non';
    this.ui.debugEle.style.display = this.debug ? 'block' : 'none';
    this.ui.boardStateEle.style.display = this.debug ? 'block' : 'none';
  }
}
  clr() {
    this.ctx.clearRect(0, 0, this.ui.canvas.width, this.ui.canvas.height);
  }
  drawBoard() {
    const boardHue = 45;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        this.ctx.beginPath();
        if (( row + col) % 2 === 0) {
          this.ctx.fillStyle = `hsl(${boardHue}, 100%, 85%)`;
          this.ctx.fillRect(col * 100, row * 100, 100, 100);
        } else {
          this.ctx.fillStyle = `hsl(${boardHue}, 50%, 50%)`;
          this.ctx.fillRect(col * 100, row * 100, 100, 100);
        }
      }
    }
  }
drawPossibleMoves() {
  // When disc is grabbed, show available moves
  if (this.grabbedDisc.disc) {
    if (this.grabbedDisc.type === 'captor') {
      const captureMoves = this.findCaptureMoves(this.grabbedDisc.disc); 
      for (let m of captureMoves) {
        const ghostDisc = new Disc(m.row, m.col, CONSTANTS.GHOST)
        ghostDisc.draw(this.ctx);
      }
    } else if (this.grabbedDisc.type === 'mover') {
      const nonCaptureMoves = this.findNonCaptureMoves(this.grabbedDisc.disc);
      for (let m of nonCaptureMoves) {
        const ghostDisc = new Disc(m.row, m.col, CONSTANTS.GHOST)
        ghostDisc.draw(this.ctx);
      }
    }
  }
}
drawDiscs() {
  for (let disc of this.discs) {
    disc.draw(this.ctx, this.mouseCoords.mouseX, this.mouseCoords.mouseY);
  }
}
drawAll() {
  this.drawBoard();
  this.drawDiscs();
  this.panel.draw(this.captures, this.turnColor);
  this.drawPossibleMoves();
}


}