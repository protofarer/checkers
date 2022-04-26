import Game from './modules/game';
import Panel from './modules/panel';

export function setupApp(id) {

  const container = document.createElement('div');
  container.id = id;
  document.body.appendChild(container);

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

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

  const debugResetButton = document.createElement('button');
  debugResetButton.innerText = 'debug\nreset';
  infoWrapper.appendChild(debugResetButton);

  return {
    canvas,
    statusEle, debugEle, boardStateEle, 
    debugButton,resetButton, debugResetButton
  };
}

export function clr(canvas, ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
