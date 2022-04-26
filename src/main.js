import setupExternalUI from './modules/init.js';
import Game from './modules/game.js';

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
  game = new Game(ui, debug);
}

(function draw() {
  game.clr();
  game.drawAll();
  ui.updateAll(game);
  requestAnimationFrame(draw);
}())
