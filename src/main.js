import {
  canvas, ctx, status, debug,
  clr, board, Disc, BLANK, BLACK, RED
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

canvas.onclick = function(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  console.log(`x:${x} y:${y}`);
  for (let disc of discs) {
    if (disc.isClicked(x, y)){
      console.log('disc clicked at r:',disc.row,' c:', disc.col);
    }
  }
}

function draw() {
  drawBoard();
  drawDiscs();
}

draw();