import Game from './modules/game';
import Panel from './modules/panel';
import { setupEventListeners } from './modules/listeners';
import './style.css'

const boardWidth = 800;
const boardHeight = 800;
const panelWidth = 300;
const panelHeight = boardHeight;

export function setupApp(id) {
  const divWrapper = document.createElement('div');
  divWrapper.id = id;
  document.body.appendChild(divWrapper);

  const canvas = document.createElement('canvas');
  canvas.width = boardWidth + panelWidth + 15;
  canvas.height = boardHeight;
  divWrapper.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  divWrapper.appendChild(document.createElement('hr'));

  const infoWrapper = document.createElement('div');
  divWrapper.appendChild(infoWrapper);
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

  const rect = canvas.getBoundingClientRect();

  let panel = new Panel(panelWidth, panelHeight);

  return { 
    canvas, ctx, statusEle, debugEle, debugButton, boardStateEle, 
    rect, panel 
  };
}

export function setupGame() {
  const game = new Game();
  setupEventListeners();
  return game;
}

export function clr(canvas, ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
