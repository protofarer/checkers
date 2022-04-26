import setupExternalUI from './init.js';
import Game from './modules/game.js';
import Disc from './modules/disc.js';

export const CONSTANTS = {
  BLANK: 0,
  BLACK: 1,
  RED: 2,
  GHOST: 3,
}

const initDebugMode = true;

let ui = setupExternalUI('html')
let game = new Game(ui, initDebugMode);

export function resetGame(debug=false) {
  game = new Game(ui, false);
}

export function debugResetGame() {
  game = new Game(ui, true);
}

(function draw() {
  game.clr();
  game.drawAll();
  ui.updateAll(game);
  requestAnimationFrame(draw);
}())






