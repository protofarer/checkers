import './style.css'
import { CONSTANTS } from './main';
import Disc from './modules/disc';
import Board from './modules/board';

export function setupApp(id) {
  const boardWidth = 800;
  const boardHeight = 800;
  const divWrapper = document.createElement('div');
  divWrapper.id = id;
  document.body.appendChild(divWrapper);

  const canvas = document.createElement('canvas');
  canvas.width = boardWidth;
  canvas.height = boardHeight;
  divWrapper.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  divWrapper.appendChild(document.createElement('hr'));

  const infoWrapper = document.createElement('div');
  divWrapper.appendChild(infoWrapper);
  infoWrapper.style.display = 'flex';
  infoWrapper.style.gap = '30px';
  
  const statusEle = document.createElement('div');
  statusEle.id = 'status';
  infoWrapper.appendChild(statusEle);

  const debugButton = document.createElement('button');
  debugButton.id = 'debugButton';
  debugButton.innerText = 'turn debug off'
  infoWrapper.appendChild(debugButton);

  const debugEle = document.createElement('div');
  debugEle.id = 'debug';
  infoWrapper.appendChild(debugEle);
  
  const boardStateEle = document.createElement('div');
  boardStateEle.id = 'boardState';
  boardStateEle.style.border = '1px dotted blue';
  boardStateEle.style.fontSize = '12px';
  infoWrapper.appendChild(boardStateEle);

  let cX, cY;
  let mouseX, mouseY;
  const rect = canvas.getBoundingClientRect();

  return { canvas, ctx, statusEle, debugEle, debugButton, boardStateEle, cX, cY, mouseX, mouseY, rect };
}

export function setupGame() {
  let board = new Board();
  let discs = initDiscs(board.boardState);
  let gameState = {
    board,
    discs,
    turnColor: CONSTANTS.BLACK,
    turnCount: 0,
    captures: {
      forRed: 0,
      forBlack: 0
    },
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
