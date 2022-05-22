import Game from './game.js'
import setupExternalUI from './init.js'
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

// Read URL for match state (till proper match store solution)
const parsedURL = new URL(window.location.href)
const networkType = parsedURL.searchParams.get('networkType')
const matchLength = parsedURL.searchParams.get('matchLength')
const privacy = parsedURL.searchParams.get('privacy')
const red = parsedURL.searchParams.get('red')
const black = parsedURL.searchParams.get('black')
const gameNo = parsedURL.searchParams.get('gameNo')
let match = {
  networkType,
  matchLength,
  gameNo,
  privacy,
  red,
  black,
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
  incrementMatch(match, game.winner)

  // Present modal view and "escape" options
  game.endDialog.show()
}

function incrementMatch(winner) {
  if (winner === CONSTANTS.BLACK) {
    match.black++
  } else {
    match.red++
  }
  match.gameNo++
}

export function startNewMatch() {
  match.score = { red: 0, black: 0 }
  match.gameNo = 0
  startNewGame()
}

export function nextGame() {
  // Update match state with already incremented match state and load new game
  // EndDialog button

  // Use document instead of window since app may be enapsulated in 
  // a window hierarchy, eg iframe

  const currURL = new URL(location.href)
  let nextSearchParams = new URLSearchParams(currURL)
  for (let k of nextSearchParams.keys()) {
    nextSearchParams.set(k, match[k])
  }
  console.log(`nextSearchParams`, nextSearchParams)
  location.replace(location.href + nextSearchParams.toString())
}
