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

function main() {
  const boardWidth = 800;
  const boardHeight = 800;
  let { canvas, ctx, statusEle, debugEle } = setupApp(
    'app', 
    boardWidth, 
    boardHeight
    );
  const rect = canvas.getBoundingClientRect();
    

  let board = new Board();
  console.log(board.state);
  let discs = initDiscs(board.state);

  let state = {
    board,
    discs,
    turn: CONSTANTS.BLACK,
    turnCount: 0,
    capturesForRed: 0,
    capturesForBlack: 0,
    debug: 1,
  }

  setupEventListeners(canvas, mouseX, mouseY, cX, cY, rect, discs);
  updateDebug(debugEle, rect, canvas);
  // Draw and collision loop

  function draw() {
    clr(canvas, ctx);
    drawBoard(ctx);
    updateDiscs(ctx, discs);
    requestAnimationFrame(draw);
  }
  draw();
}

function setupEventListeners(canvas, mouseX, mouseY, cX, cY, state, rect, discs) {
  document.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mousedown', handleMouseDown); 
  canvas.addEventListener('mouseup', handleMouseUp); 
  
  function handleMouseMove(e) {
    mouseX = e.clientX - rect.left; //window.scrollX
    mouseY = e.clientY - rect.top;
    cX = e.clientX;
    cY = e.clientY;
  }

  // does this have access to discs?
  function handleMouseDown(e) {
    // console.log(`clientX,Y: ${e.clientX},${e.clientY}`);
    // console.log(`mouseX:${mouseX} mouseY:${mouseY}`);
    for (let disc of discs) {
      if (disc.isClicked(mouseX, mouseY)){
        console.log(disc.toString());
        disc.toggleGrab();
        // console.log('possibleMoves', disc.validMoveLocations());
        // console.log(disc.isGrabbed);
      }
    }
  }

  function handleMouseUp(e) {
    for (let disc of discs) {
      if (disc.isGrabbed) {
        if (disc.isValidMove()) {
          board[disc.row][disc.col] = 0;
          [disc.col, disc.row] = getSquareFromMouse();
          board[disc.row][disc.col] = disc.color;
          if (disc.row === 0 || disc.row === 7) {
            disc.direction *= -1;
          }
          // console.log(board);
        }
        disc.toggleGrab();
        // console.log(disc.isGrabbed);
      }
    }
  }

  function toggleDebug(e) {
    if (state.debug) {
      debugButton.innerText = 'turn debug off';

    }

  }
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

main();