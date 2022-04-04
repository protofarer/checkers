import { 
  setupApp, 
  setupGame, 
  clr, 
 } from './init.js';
import Board from './modules/board.js';
import Disc from './modules/disc.js';

export const CONSTANTS = {
  BLANK: 0,
  BLACK: 1,
  RED: 2,
  GHOST: 3,
}

export let { 
  canvas, ctx, statusEle, debugEle, debugButton, cX, cY, mouseX, mouseY, rect,
} = setupApp('app');

export let {
  board, discs, gameState
} = setupGame();

function main() {
  setupEventListeners();

  function draw() {
    clr(canvas, ctx);
    Board.draw(ctx);
    updateDiscs(ctx, discs);
    updateDebug(debugEle, rect, canvas);
    requestAnimationFrame(draw);
  }
  draw();
}
main();

function setupEventListeners() {
  document.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mousedown', handleMouseDown); 
  canvas.addEventListener('mouseup', handleMouseUp); 
  debugButton.addEventListener('click', toggleDebug);
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
        board.boardState[disc.row][disc.col] = 0;
        [disc.col, disc.row] = getSquareFromMouse();
        board.boardState[disc.row][disc.col] = disc.color;
        if (disc.row === 0 || disc.row === 7) {
          disc.direction *= -1;
        }
      }
      disc.toggleGrab();
    }
  }
}

function toggleDebug(e) {
  gameState.debug = !gameState.debug;
  debugButton.innerText = gameState.debug 
    ? 'turn debug off' 
    : 'turn debug on';
}

function updateDiscs(ctx, discs) {
  for (let disc of discs) {
    disc.draw(ctx);
    // disc.registerPath();
  }
  showPossibleMoves(ctx, discs);
}

function getSquareFromMouse() {
  // Returns the row and colum of the square under the current mouse position
  const floorX = Math.floor(mouseX/100);
  const floorY = Math.floor(mouseY/100);
  const square = [floorX, floorY];
  return square;
}

function showPossibleMoves(ctx, discs) {
  for (let disc of discs) {
    if (disc.isGrabbed) {
      const possibleMoves = disc.validMoveLocations();
      for (let m of possibleMoves) {
        const ghostDisc = new Disc(m.row, m.col, CONSTANTS.GHOST)
        ghostDisc.draw(ctx);
      }
    }
  }
}

export function updateDebug(debugEle, rect, canvas) {
  debugEle.innerText = 
  `client: ${cX},${cY}
  mouse: ${Math.floor(mouseX)},${Math.floor(mouseY)}
  row,col: ${parseFloat((mouseY)/100,2).toFixed(2)},${parseFloat((mouseX)/100,2).toFixed(2)}
  rectpos: ${Math.floor(rect.left)},${Math.floor(rect.top)}
  canvas: ${canvas.width},${canvas.height}`;
}