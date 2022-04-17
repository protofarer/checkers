import { 
  setupApp, 
  setupGame, 
  clr, 
 } from './init.js';
import {
  mouseX, mouseY,
  cX, cY,
  setupEventListeners,
} from './modules/listeners.js';

import Board from './modules/board.js';
import Panel from './modules/panel.js';
import Disc from './modules/disc.js';

export const CONSTANTS = {
  BLANK: 0,
  BLACK: 1,
  RED: 2,
  GHOST: 3,
}

export let { 
  canvas, ctx, statusEle, debugEle, debugButton, boardStateEle, 
  rect,
} = setupApp('app');

export let {
  gameState, panel
} = setupGame();


function main() {
  function draw() {
    clr(canvas, ctx);
    Board.draw(ctx);
    panel.draw(ctx, gameState);
    drawDiscs(ctx, gameState.discs);
    drawPossibleMoves();
    drawStatus();
    drawDebugEle(debugEle, rect, canvas);
    drawBoardStateEle(boardStateEle);
    requestAnimationFrame(draw);
  }
  draw();
}
main();

function drawPossibleMoves() {
  // When disc is grabbed, show available moves
  if (gameState.grabbedDisc.disc) {
    if (gameState.grabbedDisc.type === 'captor') {
      const captureMoves = findCaptureMoves(gameState.grabbedDisc.disc); 
      for (let m of captureMoves) {
        const ghostDisc = new Disc(m.row, m.col, CONSTANTS.GHOST)
        ghostDisc.draw(ctx);
      }
    } else if (gameState.grabbedDisc.type === 'mover') {
      const nonCaptureMoves = findNonCaptureMoves(gameState.grabbedDisc.disc);
      for (let m of nonCaptureMoves) {
        const ghostDisc = new Disc(m.row, m.col, CONSTANTS.GHOST)
        ghostDisc.draw(ctx);
      }
    }
  }
}

function drawDiscs(ctx, discs) {
  for (let disc of discs) {
    disc.draw(ctx);
  }
}

export function findNonCaptureMoves(disc) {
    let nonCaptureMoves = [];
    if (disc.row + disc.direction >= 0 && 
        disc.row + disc.direction < 8) {
      if ((disc.col + 1 < 8) && 
          (gameState.board[disc.row + disc.direction][disc.col + 1] === 0)) {
        nonCaptureMoves.push({row: disc.row + disc.direction, col: disc.col + 1 })
      }
      if ((disc.col - 1 >= 0) && 
          (gameState.board[disc.row + disc.direction][disc.col - 1] === 0)) {
        nonCaptureMoves.push({ row: disc.row + disc.direction, col: disc.col - 1 })
      }
    }
    return nonCaptureMoves;
}

export function findCaptureMoves(disc) {
  let captureMoves = [];
  if (disc.row + (2*disc.direction) >= 0 &&
      disc.row + (2*disc.direction) < 8) {
    if ((gameState.board[disc.row + disc.direction][disc.col - 1] === disc.opposite) && 
      (gameState.board[disc.row + (2*disc.direction)][disc.col - 2] === 0)) {
        captureMoves.push({ row: disc.row + (2*disc.direction), col: disc.col - 2 });
    }
    if ((gameState.board[disc.row + disc.direction][disc.col + 1] === disc.opposite) &&
      (gameState.board[disc.row + (2*disc.direction)][disc.col + 2] === 0)) {
        captureMoves.push({ row: disc.row + (2*disc.direction), col: disc.col + 2 });
    }
  }
  // console.log('capmoves', captureMoves)
  return captureMoves;
}

// disc manager
export function findPotentialCaptors(discs) {
  const potentialCaptors = discs.filter(d => 
    findCaptureMoves(d).length > 0
  );
  // console.log('potentialCaptors', potentialCaptors)
  return potentialCaptors;
}

export function findPotentialMovers(discs) {
  const potentialMovers = discs.filter(d =>
    findNonCaptureMoves(d).length > 0);
  return potentialMovers;
}


function getSquareFromMouse() {
  // Returns the row and colum of the square under the current mouse position
  const floorX = Math.floor(mouseX/100);
  const floorY = Math.floor(mouseY/100);
  const square = [floorX, floorY];
  return square;
}


export function drawDebugEle(debugEle, rect, canvas) {
  debugEle.innerHTML = `\
    <span>
      client: ${cX},${cY} <br />
      mouse: ${Math.floor(mouseX)},${Math.floor(mouseY)}<br />
      row,col: ${Math.floor(parseFloat((mouseY)/100,2).toFixed(2))},${Math.floor((parseFloat((mouseX)/100,2).toFixed(2))) }<br />
      rectpos: ${Math.floor(rect.left)},${Math.floor(rect.top)}<br />
      canvas: ${canvas.width},${canvas.height}<br />
    </span>
  `;
}

export function drawStatus() {
  statusEle.innerHTML = `\
    <strong>Status:</strong> <br />
    message: ${gameState.msg} <br />
    turnColor: ${gameState.turnColor === CONSTANTS.BLACK ? 'black' : 'red'} <br />
    turnCount: ${gameState.turnCount} <br />
    Captures for red: ${gameState.captures.forRed} <br />
    Captures for black: ${gameState.captures.forBlack}\
  `;
}

export function drawBoardStateEle(boardStateEle) {
  boardStateEle.innerHTML = `\
    <span>${gameState.boardToHTML()}</span>\
  `;
}

export function nextTurn() {
  gameState.turnCount++;
  gameState.turnColor = gameState.turnColor === CONSTANTS.RED 
    ? CONSTANTS.BLACK 
    : CONSTANTS.RED;
}
