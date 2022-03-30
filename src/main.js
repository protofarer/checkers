import {
  canvas, ctx, status, debug, updateStatus,
  clr, board, Disc, BLANK, BLACK, RED,
  mouseX, mouseY, rect
} from './init.js';

function drawBoard() {
  const boardHue = 45;
  ctx.moveTo(0, 0);
  ctx.strokeRect(0, 0, 800, 800);
  ctx.beginPath();
  ctx.moveTo(0, 80);
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (( row + col) % 2 === 0) {
        ctx.fillStyle = `hsl(${boardHue}, 100%, 85%)`;
        ctx.fillRect(col * 100, row * 100, 100, 100);
      } else {
        ctx.fillStyle = `hsl(${boardHue}, 50%, 50%)`;
        ctx.fillRect(col * 100, row * 100, 100, 100);
      }
    }
  }
}

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
      console.log('disc clicked at r:',disc.row,' c:', disc.col);
      console.log(`clientxy@:${e.clientX},${e.clientY}`);
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