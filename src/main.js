import setupExternalUI from './modules/init.js';
import Game from './modules/game.js';
import setupDebugGUI from './modules/debugGUI.js';

export const ENV = new (function() {
  this.MODE = import.meta.env ? import.meta.env.MODE : 'production' 
})()

export const CONSTANTS = {
  BLANK: 0,
  BLACK: 1,
  RED: 2,
  GHOST: 3,
  PHASE_START: 4,
  PHASE_PLAY: 5,
  PHASE_END: 6,
}

const initDebugMode = false;

let ui = setupExternalUI('html')
let game = new Game(ui, initDebugMode);
let debugGUI = setupDebugGUI(game, ui)

export function resetGame(debug=false) {
  game = new Game(ui, debug);
  debugGUI = setupDebugGUI(game, ui)
}

(function draw() {
  game.clr();
  game.drawAll();
  ui.updateAll(game);
  requestAnimationFrame(draw);
}())
