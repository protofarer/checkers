import Game from './modules/game';
import Panel from './modules/panel';
import { setupEventListeners } from './modules/listeners';
import './style.css'

const boardWidth = 800;
const boardHeight = 800;
const panelWidth = 200;
const panelHeight = boardHeight;

export function setupApp(id) {
  const container = document.createElement('div');
  container.id = id;
  document.body.appendChild(container);

  const canvas = document.createElement('canvas');
  canvas.width = boardWidth + panelWidth + 15;
  canvas.height = boardHeight;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  container.appendChild(document.createElement('hr'));

  const infoWrapper = document.createElement('div');
  container.appendChild(infoWrapper);
  infoWrapper.style.display = 'flex';
  infoWrapper.style.gap = '30px';
  
  const statusEle = document.createElement('div');
  statusEle.id = 'status';
  infoWrapper.appendChild(statusEle);

  const debugButton = document.createElement('button');
  debugButton.id = 'debugButton';
  debugButton.innerText = 'turn debug off'
  infoWrapper.appendChild(debugButton);

  const debugEle = document.createElement('div');
  debugEle.id = 'debug';
  infoWrapper.appendChild(debugEle);
  
  const boardStateEle = document.createElement('div');
  boardStateEle.id = 'boardState';
  boardStateEle.style.border = '1px dotted blue';
  boardStateEle.style.fontSize = '12px';
  infoWrapper.appendChild(boardStateEle);

  const resetButton = document.createElement('button');
  resetButton.innerText = 'reset';
  infoWrapper.appendChild(resetButton);

  const rect = canvas.getBoundingClientRect();

  let panel = new Panel(panelWidth, panelHeight, ctx);

  return { 
    canvas, ctx, statusEle, debugEle, debugButton, boardStateEle, 
    rect, panel, resetButton
  };
}

export function setupGame(ctx) {
  const game = new Game();
  const panel = new Panel(panelWidth, panelHeight, ctx, game);
  setupEventListeners();
  return { game, panel };
}

export function clr(canvas, ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
