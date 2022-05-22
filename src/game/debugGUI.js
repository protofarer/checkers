import GUI from 'lil-gui'
import { CONSTANTS } from './main'
import { resetMatch, nextGame, resetGame, debugIncrementToNextGame } from './main'

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

    const guiMatchState = gui.addFolder('MatchState')
    guiMatchState.add(game.match, 'matchLength').listen()
    guiMatchState.add(game.match, 'gameNo').listen()
    guiMatchState.add(game.match, 'red').listen()
    guiMatchState.add(game.match, 'black').listen()

    gui.add(game, 'debugOverlay').listen()
    gui.add(game, 'debugDiscPositionMarker', ['top', 'bottom', 'left', 'right', ])

    // **********************************************************************
    // ********************   GAMETEST
    // **********************************************************************
    const guiGameTest = gui.addFolder('GameTest')
    guiGameTest.add({ resetGame }, 
      'resetGame')
      .name('reset - prod')

    guiGameTest.add({ debugreset() { resetGame(true)} }, 
      'debugreset')
      .name('reset - full debug')

    const debugTriggerVictory = () => {
      // for debug
      game.phase = CONSTANTS.PHASE_END
      game.winner = game.winner === CONSTANTS.RED ? CONSTANTS.BLACK : CONSTANTS.RED
      // this.incrementMatch(this.match, this.winner)
    }

    guiGameTest.add({ debugTriggerVictory }, 'debugTriggerVictory')

    guiGameTest.add({ toggleKings() {game.toggleKings()} }, 'toggleKings')


    // Match function testing
    const guiMatchTest = gui.addFolder('MatchTest')
    guiMatchTest.add({ resetMatch }, 'resetMatch')
    guiMatchTest.add({ nextGame }, 'nextGame')
    guiMatchTest.add({ debugIncrementToNextGame }, 'debugIncrementToNextGame')

    guiMatchTest.add({ navToRoot() { window.location.assign('/')}}, 'navToRoot')

    guiGamePositioning.show(false)
    guiMouseTracking.show(false)

    return [gui, guiGamePositioning, guiGameState, guiMouseTracking, guiMatchState, guiGameTest, guiMatchTest]
  }