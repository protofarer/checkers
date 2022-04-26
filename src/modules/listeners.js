// export let mouseX, mouseY, cX, cY;
import {resetGame} from '../main.js';

export default function setupEventListeners({
    ui,
    game,
    CONSTANTS,
    mouseCoords,
  }) {

// export function setupEventListeners(props) {
//   // console.log(...props)
//   let canvas = props.canvas
//   let rect = props.rect;
//   let debugEle = props.debugEle
//   let boardStateEle = props.boardStateEle
//   let game = props.game
//   let panel = props.panel
//   let nextTurn = props.nextTurn
//   let CONSTANTS = props.CONSTANTS
//   let mouseCoords = props.mouseCoords

  let boardStateEle = ui.boardStateEle;
  let debugEle = ui.debugEle;

  document.addEventListener('mousemove', handleMouseMove);
  ui.canvas.addEventListener('mousedown', handleMouseDown); 
  ui.canvas.addEventListener('mouseup', handleMouseUp); 
  debugButton.addEventListener('click', toggleDebug);

  function handleMouseMove(e) {
    mouseCoords.mouseX = e.clientX - game.rect.left; //window.scrollX
    mouseCoords.mouseY = e.clientY - game.rect.top;
    mouseCoords.cX = e.clientX;
    mouseCoords.cY = e.clientY;
  }

  function handleMouseDown(e) {
    console.log('mousedown')
    const clickedDisc = game.discs.find(disc =>
      disc.isClicked(game.ctx, mouseCoords.mouseX, mouseCoords.mouseY));

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
    } 

    const isResetClicked = game.panel.isResetClicked(mouseCoords.mouseX, mouseCoords.mouseY);
    if (isResetClicked) {
      resetGame();
    }

    const isRedPassClicked = game.panel.isRedPassClicked(mouseCoords.mouseX, mouseCoords.mouseY);
    if (isRedPassClicked && game.turnColor === CONSTANTS.RED) {
      game.nextTurn();
    }
    const isBlackPassClicked = game.panel.isBlackPassClicked(mouseCoords.mouseX, mouseCoords.mouseY);
    if (isBlackPassClicked && game.turnColor === CONSTANTS.BLACK) {
      game.nextTurn();
    }
  }

  function handleMouseUp(e) {
    console.log('mouseup')
    // CSDR moving grabbedDisc to game
    const grabbedDisc = game.grabbedDisc.disc;
    if (grabbedDisc) {
      const isCaptor = game.captors.find(c => c === grabbedDisc); 
      const isMover = game.movers.find(m => m === grabbedDisc);
      
      // if is a captor and mouseupped on valid capture move
      if (isCaptor) {
        const captureMoves = game.findCaptureMoves(grabbedDisc);
        const validCaptureMove = captureMoves.find(move => 
          isMouseInSquare(mouseCoords.mouseX, mouseCoords.mouseY, move.row, move.col)
        );
        if (validCaptureMove) {
          game.capture(grabbedDisc, validCaptureMove);
          game.move(grabbedDisc, validCaptureMove);
        } else {
          game.msg = "Not a valid capture move";
        }
      } else if (isMover) {
        const nonCaptureMoves = game.findNonCaptureMoves(grabbedDisc);
        const nonCaptureMove = nonCaptureMoves.find(move =>
          isMouseInSquare(mouseCoords.mouseX, mouseCoords.mouseY, move.row, move.col)
        );
        if (nonCaptureMove) {
          game.move(grabbedDisc, nonCaptureMove);
          game.nextTurn();
        } else {
          game.msg = "Invalid move. Try again"
        }
      }
      if (game.hasCaptureChainStarted && game.captors.length === 0) {
        game.nextTurn();
      }
      if ((grabbedDisc.row === 0 && grabbedDisc.color === CONSTANTS.BLACK)
      || (grabbedDisc.row === 7 && grabbedDisc.color === CONSTANTS.RED)) {
        grabbedDisc.isKing = true;
      }
    }
    grabbedDisc?.toggleGrab();
    game.grabbedDisc.disc = null;
    game.grabbedDisc.type = null;
    
    function isMouseInSquare(x, y, r, c) {
      return (Math.floor(x/100) === c && Math.floor(y/100) === r)
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
}