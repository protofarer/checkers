import Game from './game.js'
import setupExternalUI from './init.js'
import setupDebugGUI from './debugGUI.js'
import CONSTANTS from './Constants'

export const ENV = new (function() {
  this.MODE = import.meta.env ? import.meta.env.MODE : 'production' 
})()


// **********************************************************************
// ********************   Load Audio Assets
// **********************************************************************
let assetsToLoad = [] 
// eslint-disable-next-line no-unused-vars
let assetsLoaded = 0

const introMusic = document.querySelector(
  Math.random() > 0.5 ? '#introMusic1' : '#introMusic2'
)
introMusic.addEventListener('canplaythrough', loadHandler, false)
introMusic.load()
assetsToLoad.push(introMusic)

const moveSound1 = document.querySelector('#move1')
moveSound1.addEventListener('canplaythrough', loadHandler, false)
moveSound1.load()
assetsToLoad.push(moveSound1)
const moveSound2 = document.querySelector('#move1')
moveSound2.addEventListener('canplaythrough', loadHandler, false)
moveSound2.load()
assetsToLoad.push(moveSound2)

export const captureSound = document.querySelector('#explosionSound')
captureSound.addEventListener('canplaythrough', loadHandler, false)
captureSound.load()
assetsToLoad.push(captureSound)

function loadHandler() {
  assetsLoaded++
  
  // introMusic.removeEventListener('canplaythrough', loadHandler, false)
  moveSound1.removeEventListener('canplaythrough', loadHandler, false)
  captureSound.removeEventListener('canplaythrough', loadHandler, false)
  introMusic.play()
  introMusic.volume = 0.1
}

// Setup Web Audio
const actx = new (window.AudioContext || window.webkitAudioContext)()

const move1Src = actx.createMediaElementSource(moveSound1)
move1Src.connect(actx.destination)
const move2Src = actx.createMediaElementSource(moveSound1)
move2Src.connect(actx.destination)
const captureSrc = actx.createMediaElementSource(captureSound)
captureSrc.connect(actx.destination)

export function playMoveSound() {
  
}

// **********************************************************************
// ********************   Setup Game: PHASE_SETUP
// **********************************************************************

// TODO if no sessionStorage values, send an alert to do game settings
//    and location.replace to game settings page

let match = {}
try {
  match = initMatch()
} catch (err) {
  alert('Session data missing or incomplete, setup a new match')
  window.location.replace('/')
}

function initMatch() {
  let match = {
    networkType: sessionStorage.getItem('networkType'),
    privacy: sessionStorage.getItem('privacy'),
    matchLength: Number(sessionStorage.getItem('matchLength')),
    gameNo: Number(sessionStorage.getItem('gameNo')),
    red: Number(sessionStorage.getItem('red')),
    black: Number(sessionStorage.getItem('black')),
  }
  console.log(`initialized match:`, match)

  for (let [key,val] of Object.entries(match)) {
    // conditional is conservative and knowably overdetermined
    if (val === '' || val === null || val === undefined) {
      console.log(`badval detected via for...of`, key, ':', val)
      throw new Error(`Detected missing match value, corrupt sessionStorage. key,val: ${key}: ${val}`)
    }
  }
  return match
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
  if (match.gameNo === 1 
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
  }

  let loopID = requestAnimationFrame(draw)
  function draw() {
    game.clr()
    game.drawAll()
    loopID = requestAnimationFrame(draw)

    // Enter PHASE_END via game.checkEndCondition()
    if (game.phase === CONSTANTS.PHASE_END) {
      cancelAnimationFrame(loopID)
      game.end()
    }
  }
}
startNewGame(initDebugMode, initDebugOverlay)

export function resetGame(toDebug=false) {
  const currURL = new URL(window.location.href)
  if (import.meta.env.DEV) {
    currURL.hash = toDebug ? '#debugmode' : '#nodebug'
  }
  location.replace(currURL.toString())
  location.reload()
}