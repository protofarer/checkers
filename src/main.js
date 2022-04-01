import {
  canvas, ctx, status, debug, 
  board, discs, 
  Disc, BLANK, BLACK, RED,
  clr, updateStatus, drawBoard,
  mouseX, mouseY
} from './init.js';


function updateDiscs() {
  for (let disc of discs) {
    disc.drawDisc();
    disc.registerPath();
  }
}


canvas.onmousedown = function(e) {
  // console.log(`clientX,Y: ${e.clientX},${e.clientY}`);
  // console.log(`mouseX:${mouseX} mouseY:${mouseY}`);
  for (let disc of discs) {
    if (disc.isClicked(mouseX, mouseY)){
      console.log(disc.toString());
      disc.toggleGrab();
      // console.log('possibleMoves', disc.validMoveLocations());
      // console.log(disc.isGrabbed);
      const possibleMoves = disc.validMoveLocations();
      for (let m of possibleMoves) {
        // console.log('ctx in validmovelocs', ctx);
        ctx.beginPath();
        ctx.arc(m[0]*100 + 50, m[1]*100 + 50, 20, 0, 2*Math.PI);
        ctx.fillStyle = 'rgb(0,0,255)';
        ctx.fill();
        ctx.closePath();
    }
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

function draw() {
  clr();
  drawBoard();
  updateDiscs();
  updateStatus();
  requestAnimationFrame(draw);
}

draw();