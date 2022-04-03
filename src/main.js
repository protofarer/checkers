import { 
  setupApp, initDiscs, 
  clr, 
  updateDebug,
 } from './init.js';

import Disc from './modules/disc.js';
import Board, { drawBoard } from './modules/board.js';

export const CONSTANTS = {
  BLANK: 0,
  BLACK: 1,
  RED: 2,
  GHOST: 3,
}
export let cX, cY;
export let mouseX, mouseY;
const boardWidth = 800;
const boardHeight = 800;
export let { canvas, ctx, statusEle, debugEle } = setupApp(
  'app', 
  boardWidth, 
  boardHeight
);
const rect = canvas.getBoundingClientRect();

export let board = new Board();

let discs = initDiscs(board.state);

let gameState = {
  board,
  discs,
  turn: CONSTANTS.BLACK,
  turnCount: 0,
  capturesForRed: 0,
  capturesForBlack: 0,
  debug: 1,
}

setupEventListeners(canvas, mouseX, mouseY, cX, cY, rect, discs);

function draw() {
  clr(canvas, ctx);
  drawBoard(ctx);
  updateDiscs(ctx, discs);
  updateDebug(debugEle, rect, canvas);
  requestAnimationFrame(draw);
}
draw();

function setupEventListeners(
  canvas, mouseX, mouseY, cX, cY, gameState, rect, discs
) {
  document.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mousedown', handleMouseDown); 
  canvas.addEventListener('mouseup', handleMouseUp); 
}

function handleMouseMove(e) {
  mouseX = e.clientX - rect.left; //window.scrollX
  mouseY = e.clientY - rect.top;
  cX = e.clientX;
  cY = e.clientY;
}

function handleMouseDown(e) {
  for (let disc of discs) {
    if (disc.isClicked(mouseX, mouseY)){
      console.log(disc.toString());
      disc.toggleGrab();
    }
  }
}

function handleMouseUp(e) {
  for (let disc of discs) {
    if (disc.isGrabbed) {
      if (disc.isValidMove()) {
        board.state[disc.row][disc.col] = 0;
        [disc.col, disc.row] = getSquareFromMouse();
        board.state[disc.row][disc.col] = disc.color;
        if (disc.row === 0 || disc.row === 7) {
          disc.direction *= -1;
        }
      }
      disc.toggleGrab();
    }
  }
}

function toggleDebug(e) {
  debugButton.innerText = gameState.debug 
    ? 'turn debug off' 
    : 'turn debug on';
}

function updateDiscs(ctx, discs) {
  for (let disc of discs) {
    disc.drawDisc(ctx);
    disc.registerPath();
  }
  showPossibleMoves(ctx, discs);
}

function getSquareFromMouse() {
  // Returns the row and colum of the square under the current mouse position
  const floorX = Math.floor(mouseX/100);
  const floorY = Math.floor(mouseY/100);
  // console.log('floorx', floorX, 'floory', floorY);
  const square = [floorX, floorY];
  // console.log('getsquarefrommouse',square);
  return square;
}

function showPossibleMoves(ctx, discs) {
  for (let disc of discs) {
    if (disc.isGrabbed) {
      const possibleMoves = disc.validMoveLocations();
      for (let m of possibleMoves) {
        // console.log('ctx in validmovelocs', ctx);
        const ghostDisc = new Disc(m.row, m.col, CONSTANTS.GHOST)
        ghostDisc.drawDisc(ctx);
      }
    }
  }
}
