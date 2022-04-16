import { 
  setupApp, 
  setupGame, 
  clr, 
 } from './init.js';
import {
  mouseX, mouseY,
  cX, cY,
  setupEventListeners,
  findCaptured,
  capturesAvailable,
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
  rect,
} = setupApp('app');

export let {
  gameState, panel
} = setupGame();


function main() {
  function draw() {
    clr(canvas, ctx);
    Board.draw(ctx);
    panel.draw(ctx, gameState);
    // isMoveAvailable();
    updateDiscs(ctx, gameState.discs);
    updateStatus(statusEle);
    
    updateDebug(debugEle, rect, canvas);
    updateBoardStateEle(boardStateEle);

    requestAnimationFrame(draw);
  }
  draw();
}
main();

function isMoveAvailable() {
  // Check if player has any moves left
  // if not
  // ...other code...
  //    update status "player" has no possible moves
  //    show button for player to pass
  //      nextTurn
  // else continue
  // return boolean
}


function updateDiscs(ctx, discs) {
  for (let disc of discs) {
    disc.draw(ctx);
  }
  showPossibleMoves(ctx, gameState.discs);
}

export function findPossibleMoves(disc) {
    let possibleMoves = [];
    if (disc.row + disc.direction >= 0 && 
        disc.row + disc.direction < 8) {
      if ((disc.col + 1 < 8) && 
          (gameState.board[disc.row + disc.direction][disc.col + 1] === 0)) {
        possibleMoves.push({row: disc.row + disc.direction, col: disc.col + 1 })
      }
      if ((disc.col - 1 >= 0) && 
          (gameState.board[disc.row + disc.direction][disc.col - 1] === 0)) {
        possibleMoves.push({ row: disc.row + disc.direction, col: disc.col - 1 })
      }
    }
    if (disc.row + (2*disc.direction) >= 0 &&
        disc.row + (2*disc.direction) < 8) {
      if ((gameState.board[disc.row + disc.direction][disc.col - 1] === disc.opposite) && 
        (gameState.board[disc.row + (2*disc.direction)][disc.col - 2] === 0)) {
          possibleMoves.push({ row: disc.row + (2*disc.direction), col: disc.col - 2 });
      }
      if ((gameState.board[disc.row + disc.direction][disc.col + 1] === disc.opposite) &&
        (gameState.board[disc.row + (2*disc.direction)][disc.col + 2] === 0)) {
          possibleMoves.push({ row: disc.row + (2*disc.direction), col: disc.col + 2 });
      }
    }
    return possibleMoves;
}

// TODO something wrong in here, keeps returning full array of discs
function findPotentialCaptors(discs) {
  return discs.filter(d => 
    capturesAvailable(
      { row: d.row, col: d.col }, 
      findPossibleMoves(d)
    )
  );
}
function showPossibleMoves(ctx, discs) {
  // console.log('IN showpossmoves()')
  // if any captures are available to player, then only show those moves
  // otherwise show all moves

  let potentialCaptors = findPotentialCaptors(discs);
  // REFACTOR using functional methods

  if (potentialCaptors.length > 0) {
    for (let disc of potentialCaptors) {
      if (disc.isGrabbed) {
        const captureMoves = capturesAvailable(
          { row: disc.row, col: disc.col }, 
          findPossibleMoves(disc)
        );
        for (let m of captureMoves) {
          const ghostDisc = new Disc(m.row, m.col, CONSTANTS.GHOST)
          ghostDisc.draw(ctx);
        }
      }
    }
  } else {
    for (let disc of discs) {
      if (disc.isGrabbed) {
          const possibleMoves = findPossibleMoves(disc);
          for (let m of possibleMoves) {
            const ghostDisc = new Disc(m.row, m.col, CONSTANTS.GHOST)
            ghostDisc.draw(ctx);
        }
      }
    }
  }

}

function getSquareFromMouse() {
  // Returns the row and colum of the square under the current mouse position
  const floorX = Math.floor(mouseX/100);
  const floorY = Math.floor(mouseY/100);
  const square = [floorX, floorY];
  return square;
}


export function updateDebug(debugEle, rect, canvas) {
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

export function updateStatus(statusEle) {
  statusEle.innerHTML = `\
    <strong>Status:</strong> <br />
    turnColor: ${gameState.turnColor === CONSTANTS.BLACK ? 'black' : 'red'} <br />
    turnCount: ${gameState.turnCount} <br />
    Captures for red: ${gameState.captures.forRed} <br />
    Captures for black: ${gameState.captures.forBlack}\
  `;
}

export function updateBoardStateEle(boardStateEle) {
  boardStateEle.innerHTML = `\
    <span>${gameState.boardToHTML()}</span>\
  `;
}

export function updatePanel() {

}

export function nextTurn() {
  gameState.turnCount++;
  gameState.turnColor = gameState.turnColor === CONSTANTS.RED 
    ? CONSTANTS.BLACK 
    : CONSTANTS.RED;
}
