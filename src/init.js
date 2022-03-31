import './style.css'

document.querySelector('#app').innerHTML = `
<canvas height="800" width="800"></canvas><br />
status: <span id="status"></span><br />
debug: <span id="debug"></span>
`

export const canvas = document.querySelector('canvas');
export const rect = canvas.getBoundingClientRect();
export const ctx = canvas.getContext('2d');
// canvas.style.borderStyle = 'solid';
export const status = document.querySelector('#status');
export const debug = document.querySelector('#debug');

export let mouseX, mouseY;
export let cX, cY;
export let board = [
  [0,2,0,2,0,2,0,2],
  [2,0,2,0,2,0,2,0],
  [0,2,0,2,0,2,0,2],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [1,0,1,0,1,0,1,0],
  [0,1,0,1,0,1,0,1],
  [1,0,1,0,1,0,1,0],
];
export const BLANK = 0;
export const BLACK = 1;
export const RED = 2;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX - rect.left; //window.scrollX
  mouseY = e.clientY - rect.top;
  cX = e.clientX;
  cY = e.clientY;
});

export function clr() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function updateStatus() {
  status.innerText = 
  `client: ${cX},${cY}
  mouse: ${Math.floor(mouseX)},${Math.floor(mouseY)}
  row,col: ${parseFloat((mouseY)/100,2).toFixed(2)},${parseFloat((mouseX)/100,2).toFixed(2)}
  rectpos: ${Math.floor(rect.left)},${Math.floor(rect.top)}
  canvas: ${canvas.width},${canvas.height}`;
}

export class Disc {
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
    this.opposite = color === RED ? BLACK : RED;
    this.path = this.registerPath();
    this.isGrabbed = false;
    this.direction = color === 'red' ? 1 : -1;
  }

  validMoveLocations() {
    let possibleMoves = [];
    if (this.row + this.direction > 0 && 
        this.row + this.direction < 8) {
      if ((this.col + 1 < 8) && (board[this.row + this.direction][this.col + 1] === 0)) {
        possibleMoves.push([this.row + this.direction, this.col + 1])
      }
      if ((this.col - 1 > 0) && (board[this.row + this.direction][this.col - 1] === 0)) {
        possibleMoves.push([this.row + this.direction, this.col - 1])
      }
    }
    if ((board[this.row + this.direction][this.col - 1] === this.opposite) && 
      (board[this.row + 2*this.direction][this.col - 1] === 0)) {
        possibleMoves.push([this.row + 2*this.direction, this.col - 1]);
      }
    if ((board[this.row + this.direction][this.col + 1] === this.opposite) &&
      (board[this.row + 2*this.direction][this.col + 1] === 0)) {
        possibleMoves.push([this.row + 2*this.direction, this.col + 1]);
      }
    for (let m in possibleMoves) {
      ctx.beginPath();
      ctx.arc(m[0]*100 + 50, m[1]*100 + 50, 10, 0, 2*Math.PI);
      ctx.strokeStyle = 'rgb(0,0,255)';
      ctx.stroke();
    }
    return possibleMoves;
  }

  isValidMove(x, y) {
    const possibleMoves = this.validMoveLocations();
    const isValidMove = possibleMoves.filter(m => isMouseInSquare(x, y, m[0], m[1])).length > 0;
    return isValidMove;
  }

  registerPath() {
    let path = new Path2D();
    const x = ((this.col) * 100) + 50;
    const y = ((this.row) * 100) + 50;
    // CSDR: IDK why the y offset for the path's center is off by ~3 pixels
    // from the drawn disc
    path.arc(x, y+3, 42, 0, 2*Math.PI);
    return path;
  }

  isClicked(x, y) {
    const isInPath = ctx.isPointInPath(this.path, x, y);
    // if (isInPath) {
    //   console.log(x,y);
    // }
    // console.log(`disc @ r:${this.row} c:${this.col}; resulting isInPath:${isInPath}`);
    // console.log(this.registeredPath);
    // console.log('isInPath', isInPath);
    return isInPath;
  }

  toString() {
    return `Disc @ r,c: ${this.row},${this.col}`;
  }

  toggleGrab() {
    this.isGrabbed = !this.isGrabbed;
    console.log('isGrabbed', this.isGrabbed);
    return this.isGrabbed;
  }

  drawDisc() {
    // Draws game piece by referencing a row and column on board
    let x, y;
    if (this.isGrabbed) {
      x = mouseX;
      y = mouseY;
    } else {
      x = ((this.col) * 100) + 50;
      y = ((this.row) * 100) + 50;
    }
    
    ctx.strokeStyle = this.color === 'red' ? 'hsl(0,100%,20%)' : 'hsl(0,0%,80%)';
    // Adjust for differential contrast between dark on light versus light on dark lines
    ctx.lineWidth = this.color === 'red' ? 1 : 0.9; 

    // Fill disc
    ctx.save();
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
    ctx.beginPath();
    for (let i = 0; i < numRidges; i++) {
      ctx.rotate(2*Math.PI/numRidges);
      ctx.moveTo(34, 0);
      ctx.lineTo(38, 0);
    }
    ctx.stroke();
    ctx.restore();

    const numInlays = 8;
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < numInlays; i++) {
      ctx.rotate(2*Math.PI/numInlays);

      // Outer and encircled small circle
      ctx.moveTo(23, 0);
      ctx.arc(21, 0, 2, 0, 2*Math.PI);
      
      // Arc encompassing disc center
      ctx.save();
      ctx.translate(9, 0);
      ctx.rotate(Math.PI*3/12);
      ctx.moveTo(11,0);
      ctx.arc(0, 0, 11, 0, Math.PI*18/12);
      ctx.restore();
      
      // Arc outer to small circle
      ctx.save();
      ctx.translate(20, 0);
      ctx.rotate(-Math.PI*6/12);
      ctx.moveTo(9, 0);
      ctx.arc(0, 0, 9, 0, Math.PI);
      ctx.restore();
      // ctx.moveTo(20 + 9*Math.cos(-Math.PI*6/12), 9*Math.sin(-Math.PI*6/12));
      // ctx.arc(20, 0, 9, -Math.PI*6/12, Math.PI*6/12);

      // Line details 'round small circle
      ctx.save();
      ctx.translate(21, 0);
      ctx.rotate(Math.PI*-10/12);
      for (let i = 0; i < 3; i++) {
        ctx.rotate(Math.PI*5/12);
        ctx.moveTo(4, 0);
        ctx.lineTo(6, 0);
      }
      ctx.restore();
      
      // Details just within solid outer circle
      ctx.save();
      ctx.rotate(Math.PI/numInlays);
      ctx.moveTo(27, 0);
      ctx.lineTo(30, 0);
      ctx.rotate(Math.PI/24);
      ctx.moveTo(29, 0);
      ctx.lineTo(30, 0);
      ctx.rotate(-2*Math.PI/24);
      ctx.moveTo(29, 0);
      ctx.lineTo(30, 0);
      ctx.restore();
    }
    ctx.stroke();
    ctx.restore();
    ctx.restore();
  }
}

export function drawBoard() {
  const boardHue = 45;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      ctx.beginPath();
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

function isMouseInSquare(x, y, r, c) {
  return (Math.floor(x/100) === c && Math.floor(y/100) === r)
  // return (
  //   r*100 <= x && x <= (r + 1)*100 - 1 && c*100 <= y && y <= (c+1)*100 - 1
  // )      
}