import { canvas, rect, game, nextTurn, CONSTANTS, ctx, 
  debugEle, boardStateEle
} from "../main";
export let mouseX, mouseY, cX, cY;

document.addEventListener('mousemove', handleMouseMove);

function handleMouseMove(e) {
  mouseX = e.clientX - rect.left; //window.scrollX
  mouseY = e.clientY - rect.top;
  cX = e.clientX;
  cY = e.clientY;
}

function handleMouseDown(e) {
  const clickedDisc = game.discs.find(disc =>
    disc.isClicked(mouseX, mouseY));
  if (clickedDisc) {
    if (clickedDisc.color === game.turnColor) {
      const isCaptor = game.captors.find(c => c === clickedDisc);
      const isMover = game.movers.find(m => m === clickedDisc);
      if (game.captors.length > 0) {
        if (isCaptor) {
          clickedDisc.toggleGrab();
          game.grabbedDisc.disc = clickedDisc;
          game.grabbedDisc.type = "captor";
        } else if (isMover) {
          game.msg = "You must capture when possible.";
        }
      } else if (game.movers.length > 0) {
        if (isMover) {
          clickedDisc.toggleGrab();
          game.grabbedDisc.disc = clickedDisc;
          game.grabbedDisc.type = "mover";
        } else if (game.movers.length === 0 && game.captors.length === 0) {
          game.msg = "You have no moves available! Press pass to turn control to other player";
        } else {
          game.msg = "This disc cannot move!";
        }
      }
      if (!isMover && !isCaptor) {
        game.msg = "This disc has no moves available";
      }
    } else if (clickedDisc.color !== game.turnColor) {
      game.msg = "That isn't your disc!";
    }
  } else {
    game.msg = "No disc clicked";
  }
}

function handleMouseUp(e) {
  // CSDR moving grabbedDisc to game
  const grabbedDisc = game.discs.find(disc => disc.isGrabbed);
  if (grabbedDisc) {
    const isCaptor = game.captors.find(c => c === grabbedDisc); 
    const isMover = game.movers.find(m => m === grabbedDisc);
    
    // if is a captor and mouseupped on valid capture move
    if (isCaptor) {
      const captureMoves = game.findCaptureMoves(grabbedDisc);
      const validCaptureMove = captureMoves.find(move => 
        isMouseInSquare(mouseX, mouseY, move.row, move.col)
      );
      if (validCaptureMove) {
        capture(grabbedDisc, validCaptureMove);
        move(grabbedDisc, validCaptureMove);
      } else {
        game.msg = "Not a valid capture move";
      }
    } else if (isMover) {
      const nonCaptureMoves = game.findNonCaptureMoves(grabbedDisc);
      const nonCaptureMove = nonCaptureMoves.find(move =>
        isMouseInSquare(mouseX, mouseY, move.row, move.col)
      );
      if (nonCaptureMove) {
        move(grabbedDisc, nonCaptureMove);
        nextTurn();
      }    
    } else {
      game.msg = "Invalid move. Try again"
    }
    game.msg = "";
    grabbedDisc.toggleGrab();
    game.grabbedDisc.disc = null;
    game.grabbedDisc.type = null;
    if (game.hasCaptureChainStarted && game.captors.length === 0) {
      nextTurn();
    }
  }
  
  function isMouseInSquare(x, y, r, c) {
    return (Math.floor(x/100) === c && Math.floor(y/100) === r)
    }
}

function move(grabbedDisc, to) {
  game.board[grabbedDisc.row][grabbedDisc.col] = 0;
  game.board[to.row][to.col] = grabbedDisc.color;
  grabbedDisc.row = to.row;
  grabbedDisc.col = to.col;
  if (grabbedDisc.row === 0 || grabbedDisc.row === 7) {
    grabbedDisc.direction *= -1;
  }
  game.updateDiscActors();
}

function capture(grabbedDisc, to) {
  const capturedDisc = findCaptured(grabbedDisc, to);
  if (capturedDisc.color === CONSTANTS.RED) {
    game.captures.forBlack += 1;
  } else {
    game.captures.forRed += 1;
  }
  game.board[capturedDisc.row][capturedDisc.col] = 0;
  game.discs = game.discs.filter(disc => 
    !(disc.row === capturedDisc.row && disc.col === capturedDisc.col)
  );
  game.hasCaptureChainStarted = true;

  function findCaptured(from, to) {
    let col = (to.col - from.col) / Math.abs(to.col - from.col);
    col += from.col;
    let row = (to.row - from.row) / Math.abs(to.row - from.row);
    row += from.row;
    return game.discs.filter(disc => disc.col === col && disc.row === row)[0];
  }
}

function toggleDebug(e) {
  game.debug = !game.debug;
  debugButton.innerText = game.debug 
    ? 'turn debug off' 
    : 'turn debug on';
  debugEle.style.display = game.debug ? 'block' : 'none';
  boardStateEle.style.display = game.debug ? 'block' : 'none';
}

export function setupEventListeners() {
  document.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mousedown', handleMouseDown); 
  canvas.addEventListener('mouseup', handleMouseUp); 
  debugButton.addEventListener('click', toggleDebug);
}