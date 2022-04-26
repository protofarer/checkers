import Disc from './disc';
import { CONSTANTS } from '../main';
import Panel from './panel';

export default class Game {
  constructor (canvas, debugBoard=false) {
    console.log('debugboard', debugBoard)
    this.board = debugBoard
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

    this.initDiscs();
    this.updateDiscActors();

    this.ctx = canvas.getContext('2d');
    this.rect = canvas.getBoundingClientRect();
    
    this.boardHeight = 800;
    this.boardWidth = 800;
    this.panelWidth = 200;
    this.panelHeight = this.boardHeight;
    
    canvas.width = this.boardWidth + this.panelWidth + 15;
    canvas.height = this.boardHeight;
    console.log('IN game canvas', canvas)

    this.panel = new Panel(this.panelWidth, this.panelHeight, this.ctx)
  }

  initDiscs() {
    console.log('discs inited')
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
}