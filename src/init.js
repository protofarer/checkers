import './style.css'


export function setupApp(id, width, height) {
  let divWrapper = document.createElement('div');
  divWrapper.id = id;
  document.body.appendChild(divWrapper);

  let canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  divWrapper.appendChild(canvas);
  let ctx = canvas.getContext('2d');

  divWrapper.appendChild(document.createElement('hr'));

  let statusEle = document.createElement('div');
  statusEle.id = 'status';
  divWrapper.appendChild(statusEle);

  let debug = document.createElement('div');
  debug.id = 'debug';
  divWrapper.appendChild(debug);
  

  return { canvas, ctx, statusEle, debug };
}

export function clr() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function updateStatus(statusEle) {
  statusEle.innerText = 
  `client: ${cX},${cY}
  mouse: ${Math.floor(mouseX)},${Math.floor(mouseY)}
  row,col: ${parseFloat((mouseY)/100,2).toFixed(2)},${parseFloat((mouseX)/100,2).toFixed(2)}
  rectpos: ${Math.floor(rect.left)},${Math.floor(rect.top)}
  canvas: ${canvas.width},${canvas.height}`;
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

// Initialize discs
function initDiscs() {
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
}

initDiscs();