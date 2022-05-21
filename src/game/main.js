import setupExternalUI from './init.js'
import Game from './game.js'
import setupDebugGUI from './debugGUI.js'

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


// **********************************************************************
// ********************   Setup Game: PHASE_SETUP
// **********************************************************************

const parsedURL = new URL(window.location.href)
const networkType = parsedURL.searchParams.get('networkType')
const matchLength = parsedURL.searchParams.get('matchLength')
const privacy = parsedURL.searchParams.get('privacy')
let match = {
  networkType,
  matchLength,
  privacy,
  score: {
    red: 0,
    black: 0,
  },
  gameNo: 0,
}

// DEF debugMode true: debug board arrangement with debugOverlay
// DEF debugMode false: production board arrangement w/o debugOverlay
// DEF debugOverlay: debug gui + overlay
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

let ui = setupExternalUI('htmlUI')


// **********************************************************************
// ********************   Play Game: PHASE_PLAY
// **********************************************************************

let debugGUIs = []
export function startNewGame(debugMode=false, debugOverlay=false) {
  let game = new Game(match, ui, debugMode, debugOverlay)

  // will lil-gui tear itself down, assume yes once startGame completes
  // JS will cleanup
  if (import.meta.env.DEV) {
    debugGUIs = setupDebugGUI(game, ui)
    // tmp debug
    // import.meta.env.DEV && document.body.addEventListener('keypress', handleKeyPress.bind(this), { once: true })
  }

  let loopID = requestAnimationFrame(draw)
  function draw() {
    game.clr()
    game.drawAll()
    loopID = requestAnimationFrame(draw)
    if (game.phase === CONSTANTS.PHASE_END) {
      cancelAnimationFrame(loopID)
      endGame(game)
    }
  }

  // function handleKeyPress(e) {
  //   if (e.key === 'v') {
  //     console.log(`v pressed, loopID`, loopID )
  //     cancelAnimationFrame(loopID)
  //   }
  // }
}
startNewGame(initDebugMode, initDebugOverlay)

// CSDR un-exporting
export function endGame(game) {
  // Execute end game phase
  
  // Process data
  game.incrementMatch(game.match, game.winner)


  // Present modal view and "escape" options
  game.endDialog.show()

  // Teardown game scaffolding since this is point of no return
  // either: 
  //    a. new game  
  //    b. new match  
  //    c. refresh browser
  //    d. back to game settings
  teardownGame(game)
}

export function teardownGame(game) {
  // Clean up before starting new game
  // Also destroy all references so that JS will garbage collect game
  // and associated objects

  // Destroy debug GUI
  debugGUIs.forEach(g => g.destroy())

  // Remove event listeners
  game.controller.abort()

  // Remove html overlay elements
  document.body.removeChild(game.panel.infoBox)

  // Kill end dialog event listeners
  // Even though the buttons have listenerOptions: once: true
  // Low cost safeguard
  game.endDialog.hide()
}

export function startNewMatch() {
  match.score = { red: 0, black: 0 }
  match.gameNo = 0
  startNewGame()
}