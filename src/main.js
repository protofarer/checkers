import { 
  setupApp, 
  setupGame, 
  clr, 
 } from './init.js';


import {
  // mouseX, mouseY,
  // cX, cY, 
  setupEventListeners,
} from './modules/listeners.js';

import Disc from './modules/disc.js';

export const CONSTANTS = {
  BLANK: 0,
  BLACK: 1,
  RED: 2,
  GHOST: 3,
}

const containerDims = {
  boardWidth: 800,
  boardHeight: 800,
  panelWidth: 200,
  panelHeight: 800
};

export let { 
  canvas, ctx, statusEle, debugEle, debugButton, boardStateEle, 
  rect, resetButton, debugResetButton
} = setupApp('app', containerDims);

export let { game, panel } = setupGame(ctx, true, containerDims);

function main() {
  let mouseCoords = { mouseX: 0, mouseY: 0, cX: 0, cY: 0 };
  setupEventListeners({
    canvas,
    rect,
    debugEle,
    boardStateEle,
    game,
    panel,
    nextTurn,
    resetGame,
    CONSTANTS,
    mouseCoords
  });

  function draw() {
    clr(canvas, ctx);
    drawBoard(ctx);
    drawDiscs(ctx, game.discs);
    panel.draw(game);
    drawPossibleMoves();
    drawStatus();
    drawDebugEle(debugEle, rect, canvas);
    drawBoardStateEle(boardStateEle);
    requestAnimationFrame(draw);
  }
  draw();
}
main();

resetButton.addEventListener('click', () => {
  resetGame();
});

debugResetButton.addEventListener('click', () => {
  debugResetGame();
});

export function resetGame() {
  ({ game, panel } = setupGame(ctx, false, containerDims));
}

export function debugResetGame() {
 ({ game, panel } = setupGame(ctx, true, containerDims));
}

function drawBoard(ctx) {
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

function drawPossibleMoves() {
  // When disc is grabbed, show available moves
  if (game.grabbedDisc.disc) {
    if (game.grabbedDisc.type === 'captor') {
      const captureMoves = game.findCaptureMoves(game.grabbedDisc.disc); 
      for (let m of captureMoves) {
        const ghostDisc = new Disc(m.row, m.col, CONSTANTS.GHOST)
        ghostDisc.draw(ctx);
      }
    } else if (game.grabbedDisc.type === 'mover') {
      const nonCaptureMoves = game.findNonCaptureMoves(game.grabbedDisc.disc);
      for (let m of nonCaptureMoves) {
        const ghostDisc = new Disc(m.row, m.col, CONSTANTS.GHOST)
        ghostDisc.draw(ctx);
      }
    }
  }
}

function drawDiscs(ctx, discs) {
  for (let disc of discs) {
    disc.draw(ctx);
  }
}

export function drawDebugEle(debugEle, rect, canvas) {
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

export function drawStatus() {
  statusEle.innerHTML = `\
    <strong>Status:</strong> <br />
    message: ${game.msg} <br />
    turnColor: ${game.turnColor === CONSTANTS.BLACK ? 'black' : 'red'} <br />
    turnCount: ${game.turnCount} <br />
    Captures for red: ${game.captures.forRed} <br />
    Captures for black: ${game.captures.forBlack}\
  `;
}

export function drawBoardStateEle(boardStateEle) {
  boardStateEle.innerHTML = `\
    <span>${game.boardToHTML()}</span>\
  `;
}

export function nextTurn() {
  game.turnCount++;
  game.turnColor = game.turnColor === CONSTANTS.RED 
    ? CONSTANTS.BLACK 
    : CONSTANTS.RED;
  game.msg = "";
  game.hasCaptureChainStarted = false;
  game.updateDiscActors();
}
