import setupExternalUI from './init.js';
import Game from './modules/game.js';
import Disc from './modules/disc.js';

export const CONSTANTS = {
  BLANK: 0,
  BLACK: 1,
  RED: 2,
  GHOST: 3,
}

let ui = setupExternalUI('html')
let game = new Game(ui, true);

ui.resetButton.addEventListener('click', () => {
  game = new Game(ui, false);
});

ui.debugResetButton.addEventListener('click', () => {
  game = new Game(ui, true);
});

export function resetGame() {
  game = new Game(ui, false);
}

function draw() {
  game.clr();
  drawBoard(game.ctx);
  drawDiscs(game.ctx, game.discs);
  game.panel.draw(game.captures, game.turnColor);
  drawPossibleMoves();
  drawStatus();
  ui.drawDebugEle(game);
  ui.drawBoardStateEle(game);
  requestAnimationFrame(draw);
}
draw();



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
    disc.draw(ctx, game.mouseCoords.mouseX, game.mouseCoords.mouseY);
  }
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
