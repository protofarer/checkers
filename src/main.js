import { 
  setupApp, initDiscs, 
  clr, 
  updateStatus,
 } from './init.js';

import Disc from './modules/disc.js';
import Board, { drawBoard } from './modules/board.js';

export const CONSTANTS = {
  BLANK: 0,
  BLACK: 1,
  RED: 2,
  GHOST: 3,
}

function main() {
  const boardWidth = 800;
  const boardHeight = 800;
  let { canvas, ctx, status, debug } = setupApp(
    'app', 
    boardWidth, 
    boardHeight
  );
  
  let mouseX, mouseY;
  let cX, cY;

  let board = new Board();
  let discs = initDiscs(board.boardState);

  let state = {
    board,
    discs,
    turn: CONSTANTS.BLACK,
    turnCount: 0,
    capturesForRed: 0,
    capturesForBlack: 0,
  }

  document.addEventListener('mousemove', handleMouseMove(
    canvas, mouseX, mouseY, cX, cY 
  ));
  // is e as opposed to event sufficient?
  canvas.addEventListener('mousedown', handleMouseDown(e)); 
  canvas.addEventListener('mouseup', handleMouseUp(e)); 

  updateStatus(statusEle);
  // Draw and collision loop

  while (true) {
    clr(ctx);
    drawBoard(ctx);
    updateDiscs(ctx);
    requestAnimationFrame(draw);
  }
}


function updateDiscs() {
  for (let disc of discs) {
    disc.drawDisc();
    disc.registerPath();
  }
  showPossibleMoves();
}

function handleMouseMove(canvas, mouseX, mouseY, cX, cY) {
  const rect = canvas.getBoundingClientRect();
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

function getSquareFromMouse() {
  // Returns the row and colum of the square under the current mouse position
  const floorX = Math.floor(mouseX/100);
  const floorY = Math.floor(mouseY/100);
  // console.log('floorx', floorX, 'floory', floorY);
  const square = [floorX, floorY];
  // console.log('getsquarefrommouse',square);
  return square;
}

function showPossibleMoves() {
  for (let disc of discs) {
    if (disc.isGrabbed) {
      const possibleMoves = disc.validMoveLocations();
      for (let m of possibleMoves) {
        // console.log('ctx in validmovelocs', ctx);
        const ghostDisc = new Disc(m.row, m.col, CONSTANTS.GHOST)
        ghostDisc.drawDisc();
      }
    }
  }
}

main();