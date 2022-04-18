import { 
  setupApp, 
  setupGame, 
  clr, 
 } from './init.js';
import {
  mouseX, mouseY,
  cX, cY,
  setupEventListeners,
} from './modules/listeners.js';

import Board from './modules/board.js';
import Panel from './modules/panel.js';
import Disc from './modules/disc.js';

export const CONSTANTS = {
  BLANK: 0,
  BLACK: 1,
  RED: 2,
  GHOST: 3,
}

export let { 
  canvas, ctx, statusEle, debugEle, debugButton, boardStateEle, 
  rect, panel
} = setupApp('app');

export let game = setupGame();

function main() {

  function draw() {
    clr(canvas, ctx);
    Board.draw(ctx);
    panel.draw(ctx, game);
    drawDiscs(ctx, game.discs);
    drawPossibleMoves();
    drawStatus();
    drawDebugEle(debugEle, rect, canvas);
    drawBoardStateEle(boardStateEle);
    requestAnimationFrame(draw);
  }
  draw();
}
main();

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





function getSquareFromMouse() {
  // Returns the row and colum of the square under the current mouse position
  const floorX = Math.floor(mouseX/100);
  const floorY = Math.floor(mouseY/100);
  const square = [floorX, floorY];
  return square;
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

