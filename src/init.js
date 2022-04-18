import Game from './modules/game';
import { CONSTANTS } from './main';
import Disc from './modules/disc';
import Board from './modules/board';
import Panel from './modules/panel';
import { setupEventListeners } from './modules/listeners';
import './style.css'

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

  let panel = new Panel(panelWidth, panelHeight);

  return { 
    canvas, ctx, statusEle, debugEle, debugButton, boardStateEle, 
    rect, panel 
  };
}

export function setupGame() {
  // const initBoard = [
  //     [0,2,0,2,0,2,0,2],
  //     [2,0,2,0,2,0,2,0],
  //     [0,2,0,2,0,2,0,2],
  //     [0,0,0,0,0,0,0,0],
  //     [0,0,0,0,0,0,0,0],
  //     [1,0,1,0,1,0,1,0],
  //     [0,1,0,1,0,1,0,1],
  //     [1,0,1,0,1,0,1,0],
  //   ];
  // let gameState = {
  //   board: structuredClone(initBoard),
  //   boardToHTML: function() {
  //     let s = '';
  //     for (let r of this.board) {
  //       s += `${r.join(' ')}<br />`;
  //     }
  //     return s;
  //   },
  //   discs: initDiscs(initBoard),
  //   turnColor: CONSTANTS.BLACK,
  //   turnCount: 0,
  //   captures: {
  //     forRed: 0,
  //     forBlack: 0
  //   },
  //   msg: "",
  //   debug: true,
  //   grabbedDisc: {
  //     disc: null,
  //     type: null,
  //   },
  //   movers: {},
  //   captors: {},
  //   findNonCaptureMoves: function (disc) {
  //     let nonCaptureMoves = [];
  //     if (disc.row + disc.direction >= 0 && 
  //         disc.row + disc.direction < 8) {
  //       if ((disc.col + 1 < 8) && 
  //           (this.board[disc.row + disc.direction][disc.col + 1] === 0)) {
  //         nonCaptureMoves.push({row: disc.row + disc.direction, col: disc.col + 1 })
  //       }
  //       if ((disc.col - 1 >= 0) && 
  //           (this.board[disc.row + disc.direction][disc.col - 1] === 0)) {
  //         nonCaptureMoves.push({ row: disc.row + disc.direction, col: disc.col - 1 })
  //       }
  //     }
  //     return nonCaptureMoves;
  //   },
  //   findCaptureMoves: function (disc) {
  //     let captureMoves = [];
  //     if (disc.row + (2*disc.direction) >= 0 &&
  //         disc.row + (2*disc.direction) < 8) {
  //       if ((this.board[disc.row + disc.direction][disc.col - 1] === disc.opposite) && 
  //         (this.board[disc.row + (2*disc.direction)][disc.col - 2] === 0)) {
  //           captureMoves.push({ row: disc.row + (2*disc.direction), col: disc.col - 2 });
  //       }
  //       if ((this.board[disc.row + disc.direction][disc.col + 1] === disc.opposite) &&
  //         (this.board[disc.row + (2*disc.direction)][disc.col + 2] === 0)) {
  //           captureMoves.push({ row: disc.row + (2*disc.direction), col: disc.col + 2 });
  //       }
  //     }
  //     // console.log('capmoves', captureMoves)
  //     return captureMoves;
  //   },
  //   hasCaptureChainStarted: false,
  //   updateDiscActors: function() {
  //     this.movers = findPotentialMovers(this.discs);
  //     this.captors = findPotentialCaptors(this.discs);
  //     console.log('movers',this.movers)
  //     console.log('captors', this.captors)
  //     function findPotentialCaptors(discs) {
  //       const potentialCaptors = discs.filter(d => 
  //         gameState.findCaptureMoves(d).length > 0 && d.color === gameState.turnColor
  //       );
  //       // console.log('potentialCaptors', potentialCaptors)
  //       return potentialCaptors;
  //     }
    
  //     function findPotentialMovers(discs) {
  //       const potentialMovers = discs.filter(d =>
  //         gameState.findNonCaptureMoves(d).length > 0 && d.color === gameState.turnColor);
  //       return potentialMovers;
  //     }
  //   },
  // }
  const game = new Game();
  setupEventListeners();
  return game;
}

export function clr(canvas, ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Initialize discs
// export function initDiscs(board) {
//   let discs = [];
//   for (let i = 0; i < 8; i++) {
//     for (let j = 0; j < 8; j++) {
//       switch(board[i][j]) {
//         case CONSTANTS.RED:
//           discs.push(new Disc(i, j, CONSTANTS.RED));
//           break;
//         case CONSTANTS.BLACK:
//           discs.push(new Disc(i, j, CONSTANTS.BLACK));
//           break;
//         case CONSTANTS.BLANK:
//           break;
//         default:
//           console.log('unhandled board object render');
//           debug.innerText += 'error rendering board object';
//       }
//     }
//   }
//   return discs;
// }
