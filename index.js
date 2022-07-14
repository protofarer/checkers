import BoardDisc from './game/CanvasComponents/Disc'

const formEle = document.querySelector('form')

formEle.addEventListener('submit', (e) => {
  e.preventDefault()
  new FormData(formEle)
  window.location.assign('game/')
})

formEle.addEventListener('formdata', (e) => {
  let data = e.formData
  for (let [key, val] of data.entries()) {
    window.sessionStorage.setItem(key, val)
  }
})


const settingsMusic = document.querySelector('#settingsMusic')
settingsMusic.addEventListener('canplaythrough', loadHandler, false)
settingsMusic.load()

function loadHandler() {
  settingsMusic.removeEventListener('canplaythrough', loadHandler, false)
  settingsMusic.play()
  settingsMusic.volume = 0.3
}
// CSDR import.meta.env.DEV && options to start game in prod or debug

const canvasLeft = document.querySelector('#leftDisc')
const ctxLeft = canvasLeft.getContext('2d')
const canvasRight = document.querySelector('#rightDisc')
const ctxRight = canvasRight.getContext('2d')

// canvasLeft.style.border = canvasRight.style.border = '1px solid blue'

canvasLeft.width = canvasRight.width = canvasLeft.height = canvasRight.height = 105

const disc1 = new BoardDisc(canvasLeft, 0, 0, 1)
disc1.radius = 20
disc1.isKing = true

const disc2 = new BoardDisc(canvasRight, 0, 0, 1)
disc2.radius = 20
disc2.isKing = true

function createDisc(color=null) {
  let discColor = color === 'red' ? 2 : 1
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width = canvas.height = 105
  // canvas.style.border = '1px solid red'

  const disc = new BoardDisc(canvas, 0, 0, discColor)
  disc.radius = 20
  disc.isKing = true
  return { disc, canvas, ctx }
}

let discs = []
let ctxs = []

const topRow = document.querySelector('#topDiscs')
const botRow = document.querySelector('#botDiscs')

// Fill top roqw
for (let i = 0; i < 5; i++) {
  const x = createDisc(i % 2 ? 'blac' : 'red')
  discs.push(x.disc)
  ctxs.push(x.ctx)
  topRow.append(x.canvas)
}

for (let i = 0; i < 5; i++) {
  const x = createDisc(i % 2 ? 'blac' : 'red')
  discs.push(x.disc)
  ctxs.push(x.ctx)
  topRow.append(x.canvas)
  botRow.append(x.canvas)
}

let animateStep = 0
function drawDAOC() {
  const canvas = document.querySelector('#animatedText')
  canvas.width = 380
  canvas.height = 150
  // canvas.style.border = '1px dotted green'
  const ctx = canvas.getContext('2d')
  
  ctx.font = 'bold 30px courier'
  ctx.fillStyle = 'hsl(0, 50%, 50%)'
  animateStep++

  function drawLetter(char, x, y, phase=0, ) {
    const colorAngle = Math.floor((animateStep + phase)) % 360
    ctx.fillStyle = `hsl(${colorAngle}, 100%, 50%)`
    ctx.fillText(char, x, y)
  }

  const text = 'Dark Age of Checkmelot'
  
  return () => {
    ctx.save()
    ctx.scale(1,2)
    for (let i = 0; i < text.length; i++) {
      if (text[i] !== ' ') {
        drawLetter(text[i], i*17, 45, i*135)
      }
    }
    ctx.restore()
  }
}

function animate() {
  ctxLeft.clearRect(0, 0, canvasLeft.width, canvasLeft.height)
  ctxRight.clearRect(0, 0, canvasRight.width, canvasRight.height)
  disc1.draw()
  disc2.draw()

  drawDAOC()()

  ctxs.forEach(c => c.clearRect(0, 0, 105, 105))
  discs.forEach(d => d.draw())

  requestAnimationFrame(animate)
}
animate()
