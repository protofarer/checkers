import GUI from 'lil-gui'
import { resetGame } from './main.js'

export default function setupDebugGUI(game, ui) {
    const gui = new GUI()
    const rectpos = {
      left: `${Math.floor(game.rect.left)}`,
      top: `${Math.floor(game.rect.top)}`
    }

    // gui.add(
    //   { pos: 'topright'}, 
    //   'pos', 
    //   ['topleft', 'botleft', 'botright', 'topright'])
    //   .onChange(val =>  )

    const guiGamePositioning = gui.addFolder('GamePositioning') 
    guiGamePositioning.add(rectpos, 'left').name('rect.left').listen()
    guiGamePositioning.add(rectpos, 'top').name('rect.top').listen()
    guiGamePositioning.add(ui.canvas, 'width').name('canvas.width')
    guiGamePositioning.add(ui.canvas,'height').name('canvas.height')

    const guiMouseTracking = gui.addFolder('MouseTracking')
    guiMouseTracking.add(game.mouseCoords.client, 'x').name('client.x').listen()
    guiMouseTracking.add(game.mouseCoords.client, 'y').name('client.y').listen()
    guiMouseTracking.add(game.mouseCoords.canvas, 'x').name('canvas.x').listen()
    guiMouseTracking.add(game.mouseCoords.canvas, 'y').name('canvas.y').listen()
    guiMouseTracking.add(game.mouseCoords.board, 'x').name('board.x').listen()
    guiMouseTracking.add(game.mouseCoords.board, 'y').name('board.y').listen()
    guiMouseTracking.add(game.mouseCoords.square, 'col').name('mouse.col').listen()
    guiMouseTracking.add(game.mouseCoords.square, 'row').name('mouse.row').listen()

    const guiGameState = gui.addFolder('GameState')
    guiGameState.add(game, 'turnCount').name('turnCount').listen()
    guiGameState.add(game, 'turnColor').name('turnColor').listen()
    guiGameState.add(game, 'phase').name('phase').listen()
    guiGameState.add(game, 'winner').name('winner').listen()

    const matchState = gui.addFolder('MatchState')
    matchState.add(game.match, 'matchLength').listen()
    matchState.add(game.match, 'gameNo').listen()
    matchState.add(game.match.score, 'red').listen()
    matchState.add(game.match.score, 'black').listen()

    gui.add(game, 'debugOverlay').listen()
    gui.add(game, 'debugDiscPositionMarker', ['top', 'bottom', 'left', 'right', ])

    gui.add({ resetGame }, 'resetGame').name('reset - prod')
    gui.add({ debugreset() { resetGame(true, true) } }, 'debugreset').name('reset - full debug')

    gui.add({ triggerVictory() {game.debugTriggerVictory()} }, 'triggerVictory')

    gui.add({ toggleKings() {game.toggleKings()} }, 'toggleKings')

    gui.add({ navToRoot() { window.location.assign('/')}}, 'navToRoot')

    return gui
  }