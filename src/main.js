import { 
  setupApp, 
  setupGame, 
  clr, 
 } from './init.js';

import setupEventListeners from './modules/listeners.js';
import Disc from './modules/disc.js';

export const CONSTANTS = {
  BLANK: 0,
  BLACK: 1,
  RED: 2,
  GHOST: 3,
}

let ui = setupApp('app')

let { newgame: game } = setupGame(ui.canvas, true);

let mouseCoords = { mouseX: 0, mouseY: 0, cX: 0, cY: 0 };

setupEventListeners({ 
  ui,
  game,
  nextTurn,
  resetGame,
  CONSTANTS,
  mouseCoords 
});

function draw() {
  clr(ui.canvas, game.ctx);
  drawBoard(game.ctx);
  drawDiscs(game.ctx, game.discs);
  game.panel.draw(game.captures, game.turnColor);
  drawPossibleMoves();
  drawStatus();
  drawDebugEle(ui.debugEle, game.rect, ui.canvas);
  drawBoardStateEle(ui.boardStateEle);
  requestAnimationFrame(draw);
}
draw();

ui.resetButton.addEventListener('click', () => {
  resetGame();
});

ui.debugResetButton.addEventListener('click', () => {
  debugResetGame();
});

export function resetGame() {
  ({ game } = setupGame(ui.canvas, false));
}

export function debugResetGame() {
 ({ game } = setupGame(ui.canvas, true));
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
        ghostDisc.draw(game.ctx);
      }
    } else if (game.grabbedDisc.type === 'mover') {
      const nonCaptureMoves = game.findNonCaptureMoves(game.grabbedDisc.disc);
      for (let m of nonCaptureMoves) {
        const ghostDisc = new Disc(m.row, m.col, CONSTANTS.GHOST)
        ghostDisc.draw(game.ctx);
      }
    }
  }
}

function drawDiscs(ctx, discs) {
  for (let disc of discs) {
    disc.draw(ctx, mouseCoords.mouseX, mouseCoords.mouseY);
  }
}

export function drawDebugEle(debugEle, rect, canvas) {
  debugEle.innerHTML = `\
    <span>
      client: ${mouseCoords.cX},${mouseCoords.cY} <br />
      mouse: ${Math.floor(mouseCoords.mouseX)},${Math.floor(mouseCoords.mouseY)}<br />
      row,col: ${Math.floor(parseFloat((mouseCoords.mouseY)/100,2).toFixed(2))},${Math.floor((parseFloat((mouseCoords.mouseX)/100,2).toFixed(2))) }<br />
      rectpos: ${Math.floor(rect.left)},${Math.floor(rect.top)}<br />
      canvas: ${canvas.width},${canvas.height}<br />
    </span>
  `;
}

export function drawStatus() {
  ui.statusEle.innerHTML = `\
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
