import './style.css'
import { CONSTANTS } from './main';
import Disc from './modules/disc';
import Board from './modules/board';
import Panel from './modules/panel';
import { setupEventListeners } from './modules/listeners';

const boardWidth = 800;
const boardHeight = 800;
const panelWidth = 300;
const panelHeight = boardHeight;

export function setupApp(id) {
  const divWrapper = document.createElement('div');
  divWrapper.id = id;
  document.body.appendChild(divWrapper);

  const canvas = document.createElement('canvas');
  canvas.width = boardWidth + panelWidth + 15;
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

  const rect = canvas.getBoundingClientRect();


  return { 
    canvas, ctx, statusEle, debugEle, debugButton, boardStateEle, 
    rect 
  };
}

export function setupGame() {
  let panel = new Panel(panelWidth, panelHeight);
  let board = [
      [0,2,0,2,0,2,0,2],
      [2,0,2,0,2,0,2,0],
      [0,2,0,2,0,2,0,2],
      [0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0],
      [1,0,1,0,1,0,1,0],
      [0,1,0,1,0,1,0,1],
      [1,0,1,0,1,0,1,0],
    ];
  let gameState = {
    board,
    boardToHTML: function() {
      let s = '';
      for (let r of this.board) {
        s += `${r.join(' ')}<br />`;
      }
      return s;
    },
    discs: initDiscs(board),
    turnColor: CONSTANTS.BLACK,
    turnCount: 0,
    captures: {
      forRed: 0,
      forBlack: 0
    },
    msg: "",
    debug: true,
    grabbedDisc: {
      disc: null,
      type: null,
    }
  }
  setupEventListeners();
  return { gameState, panel };
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
