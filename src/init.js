import './style.css'
import { CONSTANTS } from './main';
import Disc from './modules/disc';

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

  let debugButton = document.createElement('button');
  debugButton.id = 'debugButton';
  divWrapper.appendChild(debugButton);
  
  let debugEle = document.createElement('div');
  debugEle.id = 'debug';
  divWrapper.appendChild(debugEle);
  

  return { canvas, ctx, statusEle, debugEle };
}

export function clr(ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function updateDebug(debugEle) {
  debugEle.innerText = 
  `client: ${cX},${cY}
  mouse: ${Math.floor(mouseX)},${Math.floor(mouseY)}
  row,col: ${parseFloat((mouseY)/100,2).toFixed(2)},${parseFloat((mouseX)/100,2).toFixed(2)}
  rectpos: ${Math.floor(rect.left)},${Math.floor(rect.top)}
  canvas: ${canvas.width},${canvas.height}`;
}

// Initialize discs
export function initDiscs(board) {
  let discs = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      switch(board[i][j]) {
        case CONSTANTS.RED:
          discs.push(new Disc(i, j, CONSTANTS.RED));
          break;
        case CONSTANTS.BLACK:
          discs.push(new Disc(i, j, CONSTANTS.BLACK));
          break;
        case CONSTANTS.BLANK:
          break;
        default:
          console.log('unhandled board object render');
          debug.innerText += 'error rendering board object';
      }
    }
  }
  return discs;
}
