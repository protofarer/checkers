import {
  canvas, ctx, status, debug, updateStatus, drawBoard,
  clr, board, Disc, BLANK, BLACK, RED,
  mouseX, mouseY, rect
} from './init.js';


function updateDiscs() {
  for (let disc of discs) {
    disc.drawDisc();
    disc.registerPath();
  }
}

// Initialize discs
let discs = [];
for (let i = 0; i < 8; i++) {
  for (let j = 0; j < 8; j++) {
    switch(board[i][j]) {
      case RED:
        discs.push(new Disc(i, j, RED));
        break;
      case BLACK:
        discs.push(new Disc(i, j, BLACK));
        break;
      case BLANK:
        break;
      default:
        console.log('unhandled board object render');
        debug.innerText += 'error rendering board object';
    }
  }
}

canvas.onmousedown = function(e) {
  // console.log(`clientX,Y: ${e.clientX},${e.clientY}`);
  // console.log(`mouseX:${mouseX} mouseY:${mouseY}`);
  for (let disc of discs) {
    if (disc.isClicked(mouseX, mouseY)){
      console.log(disc.toString());
      disc.toggleGrab();
      console.log('possibleMoves', disc.validMoveLocations());
      // console.log(disc.isGrabbed);
    }
  }
}

canvas.onmouseup = function(e) {
  for (let disc of discs) {
    if (disc.isGrabbed) {
      if (disc.isValidMove(mouseX, mouseY)) {
        board[disc.row][disc.col] = 0;
        [disc.col, disc.row] = getSquareFromMouse();
        board[disc.row][disc.col] = disc.color;
        console.log(board);
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
  console.log('floorx', floorX)
  console.log('floory', floorY)
  const square = [floorX, floorY];
  console.log('getsquarefrommouse',square);
  return square;
}



function draw() {
  clr();
  drawBoard();
  updateDiscs();
  updateStatus();

  // TODO GAME LOGIC

  requestAnimationFrame(draw);
}

draw();