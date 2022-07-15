import GUI from 'lil-gui'
import CONSTANTS from '../Constants'
import { resetGame, } from '..'
import BoardDisc from '../CanvasComponents/BoardDisc'

export default function setupDebugGUI(game, frames) {
    const gui = new GUI()
    const rectpos = {
      left: `${Math.floor(game.rect.left)}`,
      top: `${Math.floor(game.rect.top)}`
    }

    const guiGamePositioning = gui.addFolder('GamePositioning') 
    guiGamePositioning.add(rectpos, 'left').name('rect.left').listen()
    guiGamePositioning.add(rectpos, 'top').name('rect.top').listen()
    guiGamePositioning.add(game.canvas, 'width').name('canvas.width')
    guiGamePositioning.add(game.canvas,'height').name('canvas.height')

    const guiGameState = gui.addFolder('GameState')
    guiGameState.add(game, 'turnCount').name('turnCount').listen()
    guiGameState.add(game, 'turnColor').name('turnColor').listen()
    guiGameState.add(game, 'phase').name('phase').listen()
    guiGameState.add(game, 'winner').name('winner').listen()
    guiGameState.add(game, 'wasThisTurnPassed').listen()
    guiGameState.add(game, 'lastPassedTurn').listen()

    const guiMatchState = gui.addFolder('MatchState')
    guiMatchState.add(game.match, 'matchLength').listen()
    guiMatchState.add(game.match, 'gameNo').listen()
    guiMatchState.add(game.match, 'red').listen()
    guiMatchState.add(game.match, 'black').listen()

    gui.add(frames, 'fps').listen()
    gui.add(game, 'debugOverlay').listen()
    gui.add(
      game, 'debugDiscPositionMarker', 
      ['top', 'bottom', 'left', 'right', '']
    )

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

    const debugTriggerVictory = (color) => {
      // for debug
      game.phase = CONSTANTS.PHASE_END
      game.winner = color 
    }

    guiGameTest.add({ debugTriggerVictoryRed() {debugTriggerVictory(CONSTANTS.RED)}}, 'debugTriggerVictoryRed')
    guiGameTest.add({ debugTriggerVictoryBlack() {debugTriggerVictory(CONSTANTS.BLACK)}}, 'debugTriggerVictoryBlack')

    guiGameTest.add({ toggleKings() {game.toggleKings()} }, 'toggleKings')

    guiGameTest.add(
      { 
        jailDisc() { 
          game.panel.jailDisc(new BoardDisc(game.canvas, 0, 0, CONSTANTS.RED)) 
        } 
      }, 'jailDisc')

    // **********************************************************************
    // **********************************************************************

    // Match function testing
    const guiMatchTest = gui.addFolder('MatchTest')
    guiMatchTest.add({ resetMatchBo3() {
      game.match.matchLength = 3
      game.endDialog.resetMatch()
    } }, 'resetMatchBo3')
    guiMatchTest.add({ nextGame() { game.endDialog.nextGame() }}, 'nextGame')

    function debugIncrementToNextGame() {
      // skips end dialog
      game.match.black++
      game.match.gameNo++
      game.endDialog.nextGame()
    }

    guiMatchTest.add({ debugIncrementToNextGame }, 'debugIncrementToNextGame')
    guiMatchTest.add({ navToRoot() { window.location.assign('/')}}, 'navToRoot')
    
    const guiPointerTracking = gui.addFolder('PointerTracking')
    guiPointerTracking.add(game.pointerCoords.client, 'x').name('client.x').listen()
    guiPointerTracking.add(game.pointerCoords.client, 'y').name('client.y').listen()
    guiPointerTracking.add(game.pointerCoords.canvas, 'x').name('canvas.x').listen()
    guiPointerTracking.add(game.pointerCoords.canvas, 'y').name('canvas.y').listen()
    guiPointerTracking.add(game.pointerCoords.square, 'col').name('square.col').listen()
    guiPointerTracking.add(game.pointerCoords.square, 'row').name('square.row').listen()

    guiGameState.show(false)
    guiMatchState.show(false)
    guiMatchTest.show(false)
    guiGamePositioning.show(false)
    guiPointerTracking.show(true)

    gui.hide()

    document.addEventListener('keydown', (e) => {
      if (e.key === '`') {
        gui._hidden === false ? gui.hide() : gui.show()
      }
    })

    // return [gui, guiGamePositioning, guiGameState, guiPointerTracking, guiMatchState, guiGameTest, guiMatchTest]
  }