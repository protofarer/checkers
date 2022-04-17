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
  const clickedDisc = gameState.discs.find(disc =>
    disc.isClicked(mouseX, mouseY) && disc.color === gameState.turnColor);
  const captors = findPotentialCaptors(gameState.discs);
  const movers = findPotentialMovers(gameState.discs);
  if (clickedDisc) {
    if (captors.find(c => c === clickedDisc)) {
      clickedDisc.toggleGrab();
    } else if (movers.find(m => m === clickedDisc)) {
      clickedDisc.toggleGrab();
    } else {
      gameState.msg = "You have no moves available! Press pass to turn control to other player";
    }
  } else {
    gameState.msg = "Nothing clicked";
  }
}

function handleMouseUp(e) {
  // CSDR moving grabbedDisc to gameState
  const grabbedDisc = gameState.discs.find(disc => disc.isGrabbed);
  const captors = findPotentialCaptors(gameState.discs);
  const isCaptor = captors.find(c => c === grabbedDisc); 
  const movers = findPotentialMovers(gameState.discs);
  const isMover = movers.find(m => m === grabbedDisc);
  if (grabbedDisc) {
    // if is a captor and mouseupped on valid capture move
    if (isCaptor) {
      const captureMoves = findCaptureMoves(grabbedDisc);
      const validCaptureMove = captureMoves.find(move => 
        isMouseInSquare(mouseX, mouseY, move.row, move.col)
      );
      if (validCaptureMove) {
        capture(
          { row: grabbedDisc.row, col: grabbedDisc.col },
          { row: validCaptureMove.row, col: validCaptureMove.col }
        );
        gameState.board[grabbedDisc.row][grabbedDisc.col] = 0;
        gameState.board[captureMove.row][captureMove.col] = grabbedDisc.color;
        grabbedDisc.row = validCaptureMove.row;
        grabbedDisc.col = validCaptureMove.col;
        if (grabbedDisc.row === 0 || grabbedDisc.row === 7) {
          grabbedDisc.direction *= -1;
        }
      } else {
        gameState.msg = "Not a valid capture move";
      }
    } else if (isMover) {
      const nonCaptureMoves = findNonCaptureMoves(grabbedDisc);
      const nonCaptureMove = nonCaptureMoves.find(move =>
        isMouseInSquare(mouseX, mouseY, move.row, move.col)
      );
      if (nonCaptureMove) {
        gameState.board[grabbedDisc.row][grabbedDisc.col] = 0;
        gameState.board[nonCaptureMove.row][nonCaptureMove.col] = grabbedDisc.color;
        grabbedDisc.row = nonCaptureMove.row;
        grabbedDisc.col = nonCaptureMove.col;
        if (grabbedDisc.row === 0 || grabbedDisc.row === 7) {
          grabbedDisc.direction *= -1;
        }
        nextTurn();
      }    
    } else {
      gameState.msg = "Invalid move. Try again"
    }
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