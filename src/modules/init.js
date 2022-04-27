import { CONSTANTS, resetGame } from '../main.js';

export default function setupExternalUI(id) {
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
  statusEle.style.width = '300px';
  infoWrapper.appendChild(statusEle);
  
  const debugButton = document.createElement('button');
  debugButton.id = 'debugButton';
  debugButton.innerText = 'toggle\ndebug\n...'
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
  resetButton.innerText = 'reset\nboard';
  infoWrapper.appendChild(resetButton);

  const debugResetButton = document.createElement('button');
  debugResetButton.innerText = 'debug\nreset\nboard';
  infoWrapper.appendChild(debugResetButton);

  const kingButton = document.createElement('button');
  kingButton.innerText = 'toggle\nkings';
  infoWrapper.appendChild(kingButton);
  
  resetButton.addEventListener('click', () => {
    resetGame();
  });
  
  debugResetButton.addEventListener('click', () => {
    resetGame(true);
  });

  function updateAll(game) {
    function drawDebugEle() {
      debugEle.innerHTML = `\
        <span>
          client: ${game.mouseCoords.cX},${game.mouseCoords.cY} <br />
          mouse: ${Math.floor(game.mouseCoords.mouseX)},${Math.floor(game.mouseCoords.mouseY)}<br />
          row,col: ${Math.floor(parseFloat((game.mouseCoords.mouseY)/100,2).toFixed(2))},${Math.floor((parseFloat((game.mouseCoords.mouseX)/100,2).toFixed(2))) }<br />
          rectpos: ${Math.floor(game.rect.left)},${Math.floor(game.rect.top)}<br />
          canvas: ${canvas.width},${canvas.height}<br />
        </span>
      `;
    }

    function drawBoardStateEle() {
      boardStateEle.innerHTML = `\
        <span>${game.boardToHTML()}</span>\
      `;
    }

    function drawStatus() {
      statusEle.innerHTML = `\
        <strong>Status:</strong> <br />
        message: ${game.msg} <br />
        <strong>Match</strong> <br />
        Red: pts <br />
        Black: pts <br />
        turnCount: ${game.turnCount} <br />
        \
      `;
    }

    drawStatus();
    drawDebugEle();
    drawBoardStateEle()
  }

  return {
    canvas,
    statusEle, debugEle, boardStateEle, 
    debugButton,resetButton, debugResetButton, kingButton,
    updateAll
  };
}