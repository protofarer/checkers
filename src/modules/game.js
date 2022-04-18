import Disc from './disc';
import { CONSTANTS } from '../main';

export default class Game {
  constructor () {
    this.board = [
      [0,2,0,2,0,2,0,2],
      [2,0,2,0,2,0,2,0],
      [0,2,0,2,0,2,0,2],
      [0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0],
      [1,0,1,0,1,0,1,0],
      [0,1,0,1,0,1,0,1],
      [1,0,1,0,1,0,1,0],
    ];
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
    return nonCaptureMoves;
  }
  findCaptureMoves(disc) {
    let captureMoves = [];
    if (disc.row + (2*disc.direction) >= 0 &&
        disc.row + (2*disc.direction) < 8) {
      if ((this.board[disc.row + disc.direction][disc.col - 1] === disc.opposite) && 
        (this.board[disc.row + (2*disc.direction)][disc.col - 2] === 0)) {
          captureMoves.push({ row: disc.row + (2*disc.direction), col: disc.col - 2 });
      }
      if ((this.board[disc.row + disc.direction][disc.col + 1] === disc.opposite) &&
        (this.board[disc.row + (2*disc.direction)][disc.col + 2] === 0)) {
          captureMoves.push({ row: disc.row + (2*disc.direction), col: disc.col + 2 });
      }
    }
    return captureMoves;
  }
  updateDiscActors() {
    this.movers = this.findPotentialMovers(this.discs);
    this.captors = this.findPotentialCaptors(this.discs);
  }
  findPotentialCaptors(discs) {
    const potentialCaptors = discs.filter(d => 
      this.findCaptureMoves(d).length > 0 && d.color === this.turnColor
    );
    return potentialCaptors;
  }
  findPotentialMovers(discs) {
    const potentialMovers = discs.filter(d =>
      this.findNonCaptureMoves(d).length > 0 && d.color === this.turnColor);
    return potentialMovers;
  }
}