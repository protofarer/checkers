const con = document.createElement('div')
con.id ='con'
con.style.border = '1px solid blue'

const body = document.querySelector('body')
body.appendChild(con)

const wildling = document.createElement('span')
wildling.style.border = '1px dotted red'
con.appendChild(wildling)

const can = document.createElement('canvas')
can.style.border = '1px dashed green'
can.id='can'
con.appendChild(can)

const ctx = can.getContext('2d')

let center = {
  x: can.width / 2,
  y: can.height / 2
}

let livecandims = {
  w: can.width,
  h: can.height
}

let livebrowsdims = {
  w: can.clientWidth,
  h: can.clientHeight
}

setInterval(() => {
  console.log('logical', livecandims)
  console.log('browsal', livebrowsdims)
  console.log(`--------------------`, )
  
}, 500)

let x = 0
setInterval(() => {
  if (x) {
    wildling.innerText = 'WWWWWWWWWWWWWWWWWWWw'
    x = 0
  } else {
    wildling.innerText = ''
    x = 1
  }
}, 1000)

ctx.arc(center.x, center.y, can.width/2 -2, 0, 2*Math.PI)
ctx.stroke()