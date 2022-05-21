import setupExternalUI from './init.js'
import Game from './game.js'
import setupDebugGUI from './debugGUI.js'
import EndDialog from './EndDialog.js'

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
let game = new Game(match, ui, initDebugMode, initDebugOverlay)
let endDialog = new EndDialog(game, false)
import.meta.env.DEV && setupDebugGUI(game, ui)


// **********************************************************************
// ********************   Play Game: PHASE_PLAY
// **********************************************************************

export function startGame() {
  console.log(`startGame match`, match)
  
  let loopID = requestAnimationFrame(draw)

  function draw() {
    game.clr()
    game.drawAll()
    loopID = requestAnimationFrame(draw)
    if (game.phase === CONSTANTS.PHASE_END) {
      cancelAnimationFrame(loopID)
      endGame()
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'v') {
      console.log(`v pressed, loopID`, loopID )
      cancelAnimationFrame(loopID)
    }
  }

  document.body.addEventListener('keypress', handleKeyPress.bind(this), { once: true })
}
startGame()

export function endGame() {
  game.incrementMatch(game.match, game.winner)
  endDialog.show()
}

export function resetGame(debugMode=false, debugOverlay=false) {
  // Remove event listeners
  game.controller.abort()

  // Remove html overlay elements
  document.body.removeChild(game.panel.infoBox)

  game = new Game(match, ui, debugMode, debugOverlay)
  debugOverlay && setupDebugGUI(game, ui)
}

export function startNewMatch() {
  endDialog.hide()
  game.match.score = { red: 0, black: 0 }
  game.match.gameNo = 0
  resetGame(game.debugMode, game.debugOverlay)
}