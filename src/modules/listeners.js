import { canvas, rect, gameState, nextTurn, CONSTANTS, ctx, 
  findNonCaptureMoves, findCaptureMoves, findPotentialCaptors,
  findPotentialMovers, debugEle, boardStateEle
} from "../main";
import Disc from "./disc";
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
    disc.isClicked(mouseX, mouseY));
  if (clickedDisc) {
    if (clickedDisc.color === gameState.turnColor) {
      const captors = findPotentialCaptors(gameState.discs);
      console.log('captors', captors)
      const isCaptor = captors.find(c => c === clickedDisc);
      const movers = findPotentialMovers(gameState.discs);
      const isMover = movers.find(m => m === clickedDisc);
      if (captors.length > 0) {
        if (isCaptor) {
          console.log('IN mousedown, isCaptor')
          
          clickedDisc.toggleGrab();
          gameState.grabbedDisc.disc = clickedDisc;
          gameState.grabbedDisc.type = "captor";
        } else if (isMover) {
          gameState.msg = "You must capture when possible."
        } 
      }
      else if (movers.length > 0) {
        if (isMover) {
          console.log('IN mousedown isMover')
          
          clickedDisc.toggleGrab();
          gameState.grabbedDisc.disc = clickedDisc;
          gameState.grabbedDisc.type = "mover";
        }
      } else if (movers.length === 0 && captors.length === 0) {
        gameState.msg = "You have no moves available! Press pass to turn control to other player";
      } else {
        gameState.msg = "This disc cannot move!";
      }
    }
    if (clickedDisc.color !== gameState.turnColor) {
      gameState.msg = "That isn't your disc!";
    } 
  } else {
    gameState.msg = "No disc clicked";
  }
}

// disc manager

function handleMouseUp(e) {
  // CSDR moving grabbedDisc to gameState
  const grabbedDisc = gameState.discs.find(disc => disc.isGrabbed);
  if (grabbedDisc) {
    const captors = findPotentialCaptors(gameState.discs);
    const isCaptor = captors.find(c => c === grabbedDisc); 
    const movers = findPotentialMovers(gameState.discs);
    const isMover = movers.find(m => m === grabbedDisc);
    
    // if is a captor and mouseupped on valid capture move
    if (isCaptor) {
      const captureMoves = findCaptureMoves(grabbedDisc);
      const validCaptureMove = captureMoves.find(move => 
        isMouseInSquare(mouseX, mouseY, move.row, move.col)
      );
      if (validCaptureMove) {
        capture(grabbedDisc, validCaptureMove);
        move(grabbedDisc, validCaptureMove);
      } else {
        gameState.msg = "Not a valid capture move";
      }
    } else if (isMover) {
      const nonCaptureMoves = findNonCaptureMoves(grabbedDisc);
      const nonCaptureMove = nonCaptureMoves.find(move =>
        isMouseInSquare(mouseX, mouseY, move.row, move.col)
      );
      if (nonCaptureMove) {
        move(grabbedDisc, nonCaptureMove);
        nextTurn();
      }    
    } else {
      gameState.msg = "Invalid move. Try again"
    }
    gameState.msg = "";
    grabbedDisc.toggleGrab();
    gameState.grabbedDisc.disc = null;
    gameState.grabbedDisc.type = null;
  }
  
  function isMouseInSquare(x, y, r, c) {
    return (Math.floor(x/100) === c && Math.floor(y/100) === r)
    }
}
function move(grabbedDisc, to) {
  gameState.board[grabbedDisc.row][grabbedDisc.col] = 0;
  gameState.board[to.row][to.col] = grabbedDisc.color;
  grabbedDisc.row = to.row;
  grabbedDisc.col = to.col;
  if (grabbedDisc.row === 0 || grabbedDisc.row === 7) {
    grabbedDisc.direction *= -1;
  }
}

function capture(grabbedDisc, to) {
  const capturedDisc = findCaptured(grabbedDisc, to);
  if (capturedDisc.color === CONSTANTS.RED) {
    gameState.captures.forBlack += 1;
  } else {
    gameState.captures.forRed += 1;
  }
  gameState.board[capturedDisc.row][capturedDisc.col] = 0;
  gameState.discs = gameState.discs.filter(disc => 
    !(disc.row === capturedDisc.row && disc.col === capturedDisc.col));

  function findCaptured(from, to) {
    let col = (to.col - from.col) / Math.abs(to.col - from.col);
    col += from.col;
    let row = (to.row - from.row) / Math.abs(to.row - from.row);
    row += from.row;
    return gameState.discs.filter(disc => disc.col === col && disc.row === row)[0];
  }
}

export function setupEventListeners() {
  document.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mousedown', handleMouseDown); 
  canvas.addEventListener('mouseup', handleMouseUp); 
  debugButton.addEventListener('click', toggleDebug);
}

function toggleDebug(e) {
  gameState.debug = !gameState.debug;
  debugButton.innerText = gameState.debug 
    ? 'turn debug off' 
    : 'turn debug on';
  debugEle.style.display = gameState.debug ? 'block' : 'none';
  boardStateEle.style.display = gameState.debug ? 'block' : 'none';
}