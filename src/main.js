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
  game.drawAll();
  ui.drawAll(game);
  requestAnimationFrame(draw);
}
draw();






