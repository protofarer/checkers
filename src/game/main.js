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
const matchLength = Number(parsedURL.searchParams.get('matchLength'))
const privacy = parsedURL.searchParams.get('privacy')
const red = Number(parsedURL.searchParams.get('red'))
const black = Number(parsedURL.searchParams.get('black'))
const gameNo = Number(parsedURL.searchParams.get('gameNo'))

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
  initDebugMode = window.location.hash === '#debugmode' ? true : false
  initDebugOverlay = false
}
// Debug setup for dev
if (import.meta.env.DEV) {
  // anchor #nodebug when testing production board state and match progressions
  // set via debugGUI "reset - prod" or "next - prod"

  // No hash is specified when game is routed from setup menu
  //  thus start with debugMode on
  // Yet enable debugMode off on gameNo 0
  // For subsequent games allow anchor to determine debugMode
  if (parsedURL.searchParams.get('gameNo') === '1' 
    && window.location.hash === '') {
      window.location.hash = '#debugmode'
  }
  initDebugMode = window.location.hash === '#debugmode' ? true : false
  initDebugOverlay = window.location.hash === '#debugmode' ? true : false
}

let ui = setupExternalUI('htmlUI')

// **********************************************************************
// ********************   Play Game: PHASE_PLAY
// **********************************************************************

export function startNewGame(debugMode=false, debugOverlay=false) {
  let game = new Game(match, ui, debugMode, debugOverlay)

  // will lil-gui tear itself down, assume yes once startGame completes
  // JS will cleanup
  if (import.meta.env.DEV) {
    setupDebugGUI(game, ui)
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
  if (game.winner === CONSTANTS.BLACK) {
    match.black++
  } else {
    match.red++
  }
  

  // Present modal view and "escape" options
  game.endDialog.show()
}

export function resetMatch() {
  match.red = match.black = 0
  match.gameNo = 1
  nextGame()
}

export function nextGame() {
  // Load next, new game by replacing URL (no history) with incremented
  //  (or non-incremented eg: restart or debug reset) match search params
  // Accessible via EndDialog button and debugGUI

  match.gameNo++

  // Use window instead of document: https://stackoverflow.com/questions/2430936/whats-the-difference-between-window-location-and-document-location-in-javascrip
  const currURL = new URL(window.location.href)
  const currDebugMode = window.location.hash
  let nextSearchParams = new URLSearchParams(currURL.search)

  for (let k of nextSearchParams.keys()) {
    nextSearchParams.set(k, match[k])
  }
  
  location.replace(
    location.origin 
    + '/game/index.html?' 
    + nextSearchParams.toString()
    + currDebugMode
  )
}

export function resetGame(toDebug=false) {
  const currURL = new URL(window.location.href)
  if (import.meta.env.DEV) {
    currURL.hash = toDebug ? '#debugmode' : '#nodebug'
  }
  location.replace(currURL.toString())
  location.reload()
}

export function debugIncrementToNextGame() {
  // skips end dialog
  match.black++
  match.gameNo++
  nextGame()
}