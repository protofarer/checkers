import {
  board, discs,
  clr, updateStatus, drawBoard, setupApp,
  mouseX, mouseY
} from './init.js';

import Disc from './modules/disc.js';
import Board from './modules/board.js';

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
  let discs = [];
  const BLANK = 0;
  const BLACK = 1;
  const RED = 2;
  const GHOST = 3;

  let state = {
    board: new Board(),
    turn: BLACK,
    turnCount: 0,
    capturesForRed: 0,
    capturesForBlack: 0,
  }
  updateStatus(statusEle);
  // Draw and collision loop

  while (true) {
    clr();
    drawBoard();
    updateDiscs();
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

document.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left; //window.scrollX
  mouseY = e.clientY - rect.top;
  cX = e.clientX;
  cY = e.clientY;
});

canvas.onmousedown = function(e) {
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

canvas.onmouseup = function(e) {
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
        const ghostDisc = new Disc(m.row, m.col, GHOST)
        ghostDisc.drawDisc();
      }
    }
  }
}

main();