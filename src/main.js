import setupExternalUI from './modules/init.js'
import Game from './modules/game.js'
import setupDebugGUI from './modules/debugGUI.js'
import VictoryDialog from './modules/VictoryDialog.js'

export const ENV = new (function() {
  this.MODE = import.meta.env ? import.meta.env.MODE : 'production' 
})()

export const CONSTANTS = {
  BLANK: 0,
  BLACK: 1,
  RED: 2,
  GHOST: 3,
  PHASE_SETUP: 4,
  PHASE_PLAY: 5,
  PHASE_END: 6,
}

export function resetGame(debugMode=false, debugOverlay=false) {
  // Remove event listeners
  game.controller.abort()

  // Remove html overlay elements
  document.body.removeChild(game.panel.gameInfo)

  game = new Game(ui, debugMode, debugOverlay)
  debugOverlay && setupDebugGUI(game, ui)
}

// **********************************************************************
// ********************   Setup Game: PHASE_SETUP
// **********************************************************************

const parsedURL = new URL(window.location.href)
const matchType = parsedURL.searchParams.get('matchType')
const privacy = parsedURL.searchParams.get('privacy')
console.log(`privary`, privacy)
console.log(`matchtype`, matchType)



// debugMode is the debug board arrangement with debug gui + overlay on
// debug overlay is debug gui + overlay
// 1. reset to normal play: no debug
// 2. reset to normal play with debug gui + overlay
// 3. reset to debugMode, all debug on

// Debug setup for prod
let initDebugMode = false
let initDebugOverlay = false
if (import.meta.env.PROD) {
  initDebugMode = window.location.hash === 'debugmode' ? true : false
  initDebugOverlay = false
}

// Debug setup for dev
if (import.meta.env.DEV) {
  initDebugMode = true
  initDebugOverlay = true
}

let ui = setupExternalUI('html')
let game = new Game(ui, initDebugMode, initDebugOverlay)
import.meta.env.DEV && setupDebugGUI(game, ui)


// **********************************************************************
// ********************   Play Game: PHASE_PLAY
// **********************************************************************

function startGame() {
  let loopID = requestAnimationFrame(draw)

  function draw() {
    game.clr()
    game.drawAll()
    ui.updateAll(game)
    loopID = requestAnimationFrame(draw)
  }

  function handleKeyPress(e) {
    if (e.key === 'v') {
      console.log(`v pressed, loopID`, loopID )
      cancelAnimationFrame(loopID)
    }
  }

  document.body.addEventListener('keypress', handleKeyPress.bind(this))
}
startGame()

// **********************************************************************
// ********************   End Game: PHASE_END
// **********************************************************************

// if (game.phase === CONSTANTS.PHASE_END) {
//   new VictoryDialog(game)
// }