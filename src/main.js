import './style.css'

document.querySelector('#app').innerHTML = `
  <canvas height="800" width="800"></canvas>
  <hr />
  status: <span id="status"></span>
  <br />
  debug: <span id="debug"></span>
`

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.style.borderStyle = 'solid';

const status = document.querySelector('#status');
const debug = document.querySelector('#debug');

function clr() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}


let board = [
  [0,2,0,2,0,2,0,2],
  [2,0,2,0,2,0,2,0],
  [0,2,0,2,0,2,0,2],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [1,0,1,0,1,0,1,0],
  [0,1,0,1,0,1,0,1],
  [1,0,1,0,1,0,1,0],
];

const BLANK = 0;
const BLACK = 1;
const RED = 2;

class Disc {
  constructor(row, col, color) {
    if (!(col >= 0 && row >= 0)) {
      throw new TypeError(`A disc's col and row must be initialized`);
    }
    if (!color) {
      throw new TypeError(`A disc must be given a color`);
    }
    this.col = col;
    this.row = row;
    this.color = color;
    this.path = this.registerPath(this.row, this.col);
  }

  registerPath (row, col) {
    let path = new Path2D();
    const x = ((col) * 100) + 50;
    const y = ((row) * 100) + 50;
    ctx.save();
    ctx.translate(x, y);
    path.arc(0, 0, 40, 0, 2*Math.PI);
    path.closePath();
    ctx.restore();
    return path;
  }

  isClicked (x, y) {
    const isInPath = ctx.isPointInPath(this.path, x, y);
    // console.log(this.registeredPath);
    // console.log('isInPath', isInPath);
    return isInPath;
  }

  toString() {
    return `Disc located @ row:${this.row} col:${this.col}`;
  }

  drawDisc() {
    // Draws game piece by referencing a row and column on board
    
    ctx.strokeStyle = this.color === 'red' ? 'hsl(0,100%,20%)' : 'hsl(0,0%,80%)';
    // Adjust for differential contrast between dark on light versus light on dark lines
    ctx.lineWidth = this.color === 'red' ? 1 : 0.9; 

    // Fill disc
    ctx.save();
    const x = ((this.col) * 100) + 50;
    const y = ((this.row) * 100) + 50;
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, 2*Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();

    // Inner circle detail
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, 2*Math.PI);
    ctx.stroke();
    
    // Outer ridges
    const numRidges = 48;
    ctx.save();
    for (let i = 0; i < numRidges; i++) {
      ctx.rotate(2*Math.PI/numRidges);
      ctx.beginPath();
      ctx.moveTo(34, 0);
      ctx.lineTo(38, 0);
      ctx.stroke();
    }
    ctx.restore();

    // Circle inlay pattern
    const numInlays = 8;
    ctx.save();
    for (let i = 0; i < numInlays; i++) {
      // Centered small circle
      ctx.rotate(2*Math.PI/numInlays);
      ctx.beginPath();
      ctx.arc(21, 0, 2, 0, 2*Math.PI);
      ctx.stroke();
      
      // Arc encompassing disc center
      ctx.moveTo(9, 0);
      ctx.beginPath();
      ctx.arc(9, 0, 11, Math.PI*3/12, Math.PI*21/12);
      ctx.stroke();

      // Arc outer to small circle
      ctx.moveTo(25,0);
      ctx.beginPath();
      ctx.arc(20, 0, 9, -Math.PI*6/12, Math.PI*6/12);
      ctx.stroke();

      // Line details 'round small circle
      ctx.save();
      ctx.translate(21, 0);
      ctx.rotate(Math.PI*-10/12);
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        ctx.rotate(Math.PI*5/12);
        ctx.moveTo(4, 0);
        ctx.lineTo(6, 0);
      }
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    ctx.restore();
  }
}

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
  console.log(discs);
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
  console.log('logging x y clicks', x, y);
  for (let disc of discs) {
    if (disc.isClicked(x, y)){
      console.log('ROW:',disc.ROW,' COL:', disc.COL);
      console.log('isClicked?', disc.isClicked(x, y));
    }
    // if (disc.isClicked(x, y)) {
    //   console.log('found dis clicked');
    // }
  }
}

function draw() {
  drawBoard();
  drawDiscs();
}

draw();