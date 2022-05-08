import GUI from "lil-gui"
import { resetGame } from "../main"

export default function setupDebugGUI(game, ui) {
    // debug GUI
    const gui = new GUI()
    const rectpos = {
      left: `${Math.floor(game.rect.left)}`,
      top: `${Math.floor(game.rect.top)}`
    }
    
    gui.add(rectpos, 'left').name('rect.left').listen()
    gui.add(rectpos, 'top').name('rect.top').listen()
    gui.add(ui.canvas, 'width').name('canvas.width')
    gui.add(ui.canvas,'height').name('canvas.height')

    gui.add(game.mouseCoords.client, 'x').name('client.x').listen()
    gui.add(game.mouseCoords.client, 'y').name('client.y').listen()
    gui.add(game.mouseCoords.canvas, 'x').name('canvas.x').listen()
    gui.add(game.mouseCoords.canvas, 'y').name('canvas.y').listen()
    gui.add(game.mouseCoords.board, 'x').name('board.x').listen()
    gui.add(game.mouseCoords.board, 'y').name('board.y').listen()
    gui.add(game.mouseCoords.square, 'col').name('mouse.col').listen()
    gui.add(game.mouseCoords.square, 'row').name('mouse.row').listen()

    gui.add(game, 'turnCount').name('turnCount').listen()
    gui.add(game, 'turnColor').name('turnColor').listen()
    gui.add(game, 'phase').name('phase').listen()
    gui.add(game, 'winner').name('winner').listen()

    gui.add({ resetGame }, 'resetGame')
    gui.add({ debugreset() { resetGame(true) } }, 'debugreset').name('debugReset')

    const triggerVictory = () => {
      game.phase = CONSTANTS.PHASE_END;
      game.winner = game.winner === CONSTANTS.RED ? CONSTANTS.BLACK : CONSTANTS.RED;
    }
    gui.add({ triggerVictory }, 'triggerVictory')

    const toggleKings = () => {
      game.discs.forEach(disc => { disc.isKing = !disc.isKing })
    }
    gui.add({ toggleKings }, 'toggleKings')

    return gui
  }