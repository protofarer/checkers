import {
  canvas, ctx, status, debug, updateStatus, drawBoard,
  clr, board, Disc, BLANK, BLACK, RED,
  mouseX, mouseY, rect
} from './init.js';


function drawDiscs() {
  for (let disc of discs) {
    disc.drawDisc();
  }
}

// Initialize discs
let discs = [];
for (let i = 0; i < 8; i++) {
  for (let j = 0; j < 8; j++) {
    switch(board[i][j]) {
      case RED:
        discs.push(new Disc(i, j, 'red'));
        break;
      case BLACK:
        discs.push(new Disc(i, j, 'black'));
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
      // console.log(disc.isGrabbed);
    }
  }
}

canvas.onmouseup = function(e) {
  for (let disc of discs) {
    if (disc.isGrabbed) {
      // if (disc.validMoveLocation()) {
      //   disc.col = getColumnFromMouse();
      //   disc.row = getRowFromMouse();
      // }
      disc.toggleGrab();
      // console.log(disc.isGrabbed);
    }
  }
}

function getSquareFromMouse() {
  // Returns the row and colum of the square under the current mouse position
  return []
}



function draw() {
  clr();
  drawBoard();
  drawDiscs();
  updateStatus();

  // TODO GAME LOGIC

  requestAnimationFrame(draw);
}

draw();