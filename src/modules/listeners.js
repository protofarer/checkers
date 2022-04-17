import { canvas, rect, gameState, nextTurn, CONSTANTS, ctx, 
  findNonCaptureMoves, findCaptureMoves, findPotentialCaptors,
  findPotentialMovers
} from "../main";

export let mouseX, mouseY, cX, cY;

document.addEventListener('mousemove', handleMouseMove);

function handleMouseMove(e) {
  mouseX = e.clientX - rect.left; //window.scrollX
  mouseY = e.clientY - rect.top;
  // setMouseX(e.clientX - rect.leftX);
  // setMouseY(e.clientY - rect.top);
  cX = e.clientX;
  cY = e.clientY;
  // setCX(e.clientX);
  // setCY(e.clientY);
}

function handleMouseDown(e) {
  const grabbedDisc = gameState.discs.find(d =>
    d.isClicked(mouseX, mouseY) && disc.color === gameState.turnColor);
  for (let disc of gameState.discs) {
    if (disc.isClicked(mouseX, mouseY) && disc.color === gameState.turnColor){
      // console.log(disc.toString(), 'is grabbed');
      disc.toggleGrab();
    }
  }
}

function handleMouseUp(e) {
  // TODO if captureMoves possible, only alloves move with potential captors
  // TODO else only allow moves with discs that can do regular moves 

  const potentialCaptors = findPotentialCaptors(gameState.discs);
  const potentialMovers = findPotentialMovers(gameState.discs);
  if (potentialCaptors.length < 0) {
    for (let potentialCaptor of potentialCaptors) {
      if (potentialCaptor.isGrabbed) {
        const captureMoves = findCaptureMoves(potentialCaptors);
        const captureMove = captureMoves.filter(move => 
          isMouseInSquare(mouseX, mouseY, move.row, move.col)
        )[0];
        capture(
          { row: potentialCaptors.row, col: potentialCaptors.col },
          {row: captureMove.row, col: captureMove.col }
        );
        gameState.board[potentialCaptors.row][potentialCaptors.col] = 0;
        gameState.board[captureMove.row][captureMove.col] = potentialCaptors.color;
        potentialCaptors.row = captureMove.row;
        potentialCaptors.col = captureMove.col;
        if (disc.row === 0 || disc.row === 7) {
          disc.direction *= -1;
        }
      }
    }
  } else if (potentialMovers.length > 0) {
    for (let disc of gameState.discs) {
      const nonCaptureMoves = findNonCaptureMoves(disc);
      const nonCaptureMove = nonCaptureMoves.filter(move =>
        isMouseInSquare(mouseX, mouseY, move.row, move.col)
      )[0];
      if (nonCaptureMove) {
        gameState.board[disc.row][disc.col] = 0;
        gameState.board[nonCaptureMove.row][nonCaptureMove.col] = disc.color;
        disc.row = nonCaptureMove.row;
        disc.col = nonCaptureMove.col;
        nextTurn();
        if (disc.row === 0 || disc.row === 7) {
          disc.direction *= -1;
        }
      }    
    }
  } else {
    // Update status no moves 
  }
  disc.toggleGrab();

  function isMouseInSquare(x, y, r, c) {
    return (Math.floor(x/100) === c && Math.floor(y/100) === r)
  }
}

function toggleDebug(e) {
  gameState.debug = !gameState.debug;
  debugButton.innerText = gameState.debug 
    ? 'turn debug off' 
    : 'turn debug on';
  debugEle.style.display = gameState.debug ? 'block' : 'none';
}

function capture(from, to) {
  const capturedDisc = findCaptured(from, to);
  if (capturedDisc.color === CONSTANTS.RED) {
    gameState.captures.forBlack += 1;
  } else {
    gameState.captures.forRed += 1;
  }
  gameState.board[capturedDisc.row][capturedDisc.col] = 0;
  gameState.discs = gameState.discs.filter(disc => 
    !(disc.row === capturedDisc.row && disc.col === capturedDisc.col));
}

export function findCaptured(from, to) {
  let col = (to.col - from.col) / Math.abs(to.col - from.col);
  col += from.col;
  let row = (to.row - from.row) / Math.abs(to.row - from.row);
  row += from.row;
  return gameState.discs.filter(disc => disc.col === col && disc.row === row)[0];
}

export function capturesAvailable(from, possibleMoves) {
  return possibleMoves.filter(p => findCaptured(from, p));
  // for (let m in possibleMoves) {
  //   if (findCaptured(from, to)) return true;
  // }
  // return false;
}

export function setupEventListeners() {
  document.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mousedown', handleMouseDown); 
  canvas.addEventListener('mouseup', handleMouseUp); 
  debugButton.addEventListener('click', toggleDebug);
}