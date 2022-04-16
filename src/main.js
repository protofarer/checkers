import { 
  setupApp, 
  setupGame, 
  clr, 
 } from './init.js';
import Board from './modules/board.js';
import Disc from './modules/disc.js';
import Panel from './modules/panel.js';

export const CONSTANTS = {
  BLANK: 0,
  BLACK: 1,
  RED: 2,
  GHOST: 3,
}

export let { 
  canvas, ctx, statusEle, debugEle, debugButton, boardStateEle, cX, cY, mouseX, mouseY, rect,
} = setupApp('app');

export let {
  board, discs, gameState, panel
} = setupGame();

function main() {
  setupEventListeners();

  function draw() {
    clr(canvas, ctx);
    Board.draw(ctx);
    panel.draw(ctx);
    updateDiscs(ctx, discs);
    updateDebug(debugEle, rect, canvas);
    updateStatus(statusEle);
    updateBoardStateEle(boardStateEle);
    requestAnimationFrame(draw);
  }
  draw();
}
main();

function setupEventListeners() {
  document.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mousedown', handleMouseDown); 
  canvas.addEventListener('mouseup', handleMouseUp); 
  debugButton.addEventListener('click', toggleDebug);
}

function handleMouseMove(e) {
  mouseX = e.clientX - rect.left; //window.scrollX
  mouseY = e.clientY - rect.top;
  cX = e.clientX;
  cY = e.clientY;
}

function handleMouseDown(e) {
  for (let disc of discs) {
    if (disc.isClicked(mouseX, mouseY)){
      console.log(disc.toString(), 'is grabbed');
      disc.toggleGrab();
    }
  }
}

function handleMouseUp(e) {
  for (let disc of discs) {
    if (disc.isGrabbed) {
      const validMove = disc.validMove();
      if (validMove) {
        if (Math.abs(validMove.row - disc.row) === 2) {
          capture(
            { row: disc.row, col: disc.col },
            {row: validMove.row, col: validMove.col }
          );
        }
        // [disc.col, disc.row] = getSquareFromMouse();
        board.boardState[disc.row][disc.col] = 0;
        disc.row = validMove.row;
        disc.col = validMove.col;
        board.boardState[validMove.row][validMove.col] = disc.color;
        if (disc.row === 0 || disc.row === 7) {
          disc.direction *= -1;
        }
      }
      disc.toggleGrab();
    }
  }
}

function capture(from, to) {
  const captured = findCaptured();
  if (captured.color === CONSTANTS.RED) {
    gameState.captures.forBlack += 1;
  } else {
    gameState.captures.forRed += 1;
  }
  console.log('updated capture state', gameState.captures);
  board.boardState[captured.row][captured.col] = 0;
  // TODO remove disc from discs

  function findCaptured() {
    let captured = {};
    captured.col = (to.col - from.col) / Math.abs(to.col - from.col);
    captured.col += from.col;
    captured.row = (to.row - from.row) / Math.abs(to.row - from.row);
    captured.row += from.row;
    captured.color = board.boardState[captured.row][captured.col];
    return captured;
  }
  // TODO update status

}

function toggleDebug(e) {
  gameState.debug = !gameState.debug;
  debugButton.innerText = gameState.debug 
    ? 'turn debug off' 
    : 'turn debug on';
  debugEle.style.display = gameState.debug ? 'block' : 'none';
}

function updateDiscs(ctx, discs) {
  for (let disc of discs) {
    disc.draw(ctx);
  }
  showPossibleMoves(ctx, discs);
}

function getSquareFromMouse() {
  // Returns the row and colum of the square under the current mouse position
  const floorX = Math.floor(mouseX/100);
  const floorY = Math.floor(mouseY/100);
  const square = [floorX, floorY];
  return square;
}

function showPossibleMoves(ctx, discs) {
  // console.log('IN showpossmoves()')
  for (let disc of discs) {
    if (disc.isGrabbed) {
      const possibleMoves = disc.possibleMoves();
      for (let m of possibleMoves) {
        const ghostDisc = new Disc(m.row, m.col, CONSTANTS.GHOST)
        ghostDisc.draw(ctx);
      }
    }
  }
}

export function updateDebug(debugEle, rect, canvas) {
  debugEle.innerHTML = `\
    <span>
      client: ${cX},${cY} <br />
      mouse: ${Math.floor(mouseX)},${Math.floor(mouseY)}<br />
      row,col: ${Math.floor(parseFloat((mouseY)/100,2).toFixed(2))},${Math.floor((parseFloat((mouseX)/100,2).toFixed(2))) }<br />
      rectpos: ${Math.floor(rect.left)},${Math.floor(rect.top)}<br />
      canvas: ${canvas.width},${canvas.height}<br />
    </span>
  `;
}

export function updateStatus(statusEle) {
  statusEle.innerHTML = `\
    <strong>Status:</strong> <br />
    turnColor: ${gameState.turnColor === CONSTANTS.BLACK ? 'black' : 'red'} <br />
    turnCount: ${gameState.turnCount} <br />
    Captures for red: ${gameState.captures.forRed} <br />
    Captures for black: ${gameState.captures.forBlack}\
  `;
}

export function updateBoardStateEle(boardStateEle) {
  boardStateEle.innerHTML = `\
    <span>${board.toHTML()}</span>\
  `;
}