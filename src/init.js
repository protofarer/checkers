import './style.css'
import { CONSTANTS } from './main';
import Disc from './modules/disc';
import Board from './modules/board';

export function setupApp(id) {
  const boardWidth = 800;
  const boardHeight = 800;
  let divWrapper = document.createElement('div');
  divWrapper.id = id;
  document.body.appendChild(divWrapper);

  let canvas = document.createElement('canvas');
  canvas.width = boardWidth;
  canvas.height = boardHeight;
  divWrapper.appendChild(canvas);
  let ctx = canvas.getContext('2d');

  divWrapper.appendChild(document.createElement('hr'));

  let statusEle = document.createElement('div');
  statusEle.id = 'status';
  divWrapper.appendChild(statusEle);

  let debugButton = document.createElement('button');
  debugButton.id = 'debugButton';
  debugButton.innerText = 'turn debug off'
  divWrapper.appendChild(debugButton);

  let debugEle = document.createElement('div');
  debugEle.id = 'debug';
  divWrapper.appendChild(debugEle);
  
  let cX, cY;
  let mouseX, mouseY;
  const rect = canvas.getBoundingClientRect();

  return { canvas, ctx, statusEle, debugEle, debugButton, cX, cY, mouseX, mouseY, rect };
}

export function setupGame() {
  let board = new Board();
  let discs = initDiscs(board.state);
  let gameState = {
    board,
    discs,
    turn: CONSTANTS.BLACK,
    turnCount: 0,
    capturesForRed: 0,
    capturesForBlack: 0,
    debug: true,
  }
  return { board, discs, gameState };
}
export function clr(canvas, ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}


// Initialize discs
export function initDiscs(board) {
  let discs = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      switch(board[i][j]) {
        case CONSTANTS.RED:
          discs.push(new Disc(i, j, CONSTANTS.RED));
          break;
        case CONSTANTS.BLACK:
          discs.push(new Disc(i, j, CONSTANTS.BLACK));
          break;
        case CONSTANTS.BLANK:
          break;
        default:
          console.log('unhandled board object render');
          debug.innerText += 'error rendering board object';
      }
    }
  }
  return discs;
}
