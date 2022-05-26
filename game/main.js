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
// eslint-disable-next-line no-unused-vars
let assetsLoaded = 0

let moveSounds = []
let captureSounds = []
let deathSounds = []

const introMusic = document.querySelector(
  Math.random() > 0.5 ? '#introMusic1' : '#introMusic2'
)
introMusic.addEventListener('canplaythrough', loadHandler, false)
introMusic.load()

const moveSound1 = document.querySelector('#move1')
moveSound1.addEventListener('canplaythrough', loadHandler, false)
moveSound1.load()
moveSounds.push(moveSound1)

const moveSound2 = document.querySelector('#move2')
moveSound2.addEventListener('canplaythrough', loadHandler, false)
moveSound2.load()
moveSounds.push(moveSound2)

const captureSound1 = document.querySelector('#capture1')
captureSound1.addEventListener('canplaythrough', loadHandler, false)
captureSound1.load()
captureSounds.push(captureSound1)

const captureSound2 = document.querySelector('#capture2')
captureSound2.addEventListener('canplaythrough', loadHandler, false)
captureSound2.load()
captureSounds.push(captureSound2)

const deathSound1 = document.querySelector('#death1')
deathSound1.addEventListener('canplaythrough', loadHandler, false)
deathSound1.load()
deathSounds.push(deathSound1)

const deathSound2 = document.querySelector('#death2')
deathSound2.addEventListener('canplaythrough', loadHandler, false)
deathSound2.load()
deathSounds.push(deathSound2)

const deathSound3 = document.querySelector('#death3')
deathSound3.addEventListener('canplaythrough', loadHandler, false)
deathSound3.load()
deathSounds.push(deathSound3)

export const kingcrownSound = document.querySelector('#kingcrown')
kingcrownSound.addEventListener('canplaythrough', loadHandler, false)
kingcrownSound.load()

export const kingdeathSound = document.querySelector('#kingdeath')
kingdeathSound.addEventListener('canplaythrough', loadHandler, false)
kingdeathSound.load()

function loadHandler() {
  assetsLoaded++
  
  // introMusic.removeEventListener('canplaythrough', loadHandler, false)
  moveSound1.removeEventListener('canplaythrough', loadHandler, false)
  moveSound2.removeEventListener('canplaythrough', loadHandler, false)
  captureSound1.removeEventListener('canplaythrough', loadHandler, false)
  captureSound2.removeEventListener('canplaythrough', loadHandler, false)
  deathSound2.removeEventListener('canplaythrough', loadHandler, false)
  deathSound2.removeEventListener('canplaythrough', loadHandler, false)
  introMusic.play()
  introMusic.volume = 0.1
}

// Setup Web Audio
const actx = new (window.AudioContext || window.webkitAudioContext)()

const move1Src = actx.createMediaElementSource(moveSound1)
move1Src.connect(actx.destination)
const move2Src = actx.createMediaElementSource(moveSound1)
move2Src.connect(actx.destination)
const capture1Src = actx.createMediaElementSource(captureSound1)
capture1Src.connect(actx.destination)
const capture2Src = actx.createMediaElementSource(captureSound1)
capture2Src.connect(actx.destination)
const death1Src = actx.createMediaElementSource(deathSound1)
death1Src.connect(actx.destination)
const death2Src = actx.createMediaElementSource(deathSound2)
death2Src.connect(actx.destination)

export const playRandomDeathSound = playRandomSoundType(deathSounds)

export const playRandomCaptureSound = (disc=null) => {
  const playCaptureSound = playRandomSoundType(captureSounds)
  const captureSound = playCaptureSound(disc)
  // TODO add delay by reacting to animate loop time passed
  //  or using audoEle.ended state
  // setTimeout(playRandomDeathSound(), 1000)
  let deathSound
  captureSound.addEventListener('ended', (e) => {
    if (disc?.isKing) {
      kingdeathSound.currentTime = 0
      kingdeathSound.play()
      deathSound = kingdeathSound
    } else {
      deathSound = playRandomDeathSound()
    }
  }, { once: true })
  return deathSound
}

export const playRandomMoveSound = playRandomSoundType(moveSounds)

function playRandomSoundType(sounds) {
  return (disc=null) => {
    const sound = sounds[Math.floor(Math.random() * sounds.length)]
    sound.currentTime = 0
    sound.play()
    return sound
  }
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