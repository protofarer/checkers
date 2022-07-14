import CONSTANTS from '../Constants'

export default class BaseDisc {
  // The Basic Disc
  //  has properties and methods: color, isKing, draw, king animation
  //  behaviors:
  //    - Fits inside whatever canvas is given to it by setting up the canvas'
  //      shortest length as its radius and positioning itself near the
  //      0,0 coordinate (origin aka top left)

    isKing = false
    kingColor = 'black'
    animateFrame = 0
    radius = 0
    center = { x: 0, y: 0 }

  constructor(canvas, color) {
    if (!(color === CONSTANTS.BLACK || color === CONSTANTS.RED)) {
      throw new Error('Disc must be either CONSTANTS.BLACK or CONSTANTS.RED')
    }
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
    this.color = color

    // Strokes adjusted for disc's fill
    this.strokeColor = this.color === CONSTANTS.RED 
    ? 'hsl(0,100%,10%)' 
    : this.color === CONSTANTS.BLACK
      ? 'hsl(0,0%,80%)'
      : 'hsl(250, 100%, 60%)'

    this.update()
  }

  toString() {
    return `center:(${this.center.x},${this.center.y})`
  }

  update(newCenter) {
    let squeeze
    if (this.canvas.width > this.canvas.height) {
      squeeze = this.canvas.height * 0.07
      this.radius = this.canvas.height / 2 - squeeze
    } else {
      squeeze = this.canvas.width * 0.07
      this.radius = this.canvas.width / 2 - squeeze
    }
    this.center = newCenter || {
      x: this.radius + squeeze,
      y: this.radius + squeeze,
    }
  }

  draw(newCenter=null) { 
    if (newCenter) this.update(newCenter)
    const animateStep = () => {
      // animateFrame, the *2*2.85 is to give high enough animate frame to reach 
      // full range of desired colors in periodicColor
      if (this.animateFrame === 45*60*2*2.85) this.animateFrame = 0
      return this.animateFrame++
    }

    const periodicColor = () => {
      if (this.animateFrame % 60 === 0) {
        if (this.color === CONSTANTS.RED) {
          // Color angle skooched right and narrowed to avoid boring red range
          const colorAngle = (Math.floor(this.animateFrame / 15) % 290) + 30
          this.kingColor = `hsl(${colorAngle}, 100%, 80%)`
        } else {
          const colorAngle = Math.floor(this.animateFrame / 15) % 360
          this.kingColor = `hsl(${colorAngle}, 100%, 70%)`
        }
      }
      return this.kingColor
    }

    // **************************************************************************
    // * Draw Basic Red/Black Disc
    // **************************************************************************
    this.ctx.save()      // save A - disc center

    // Don't translate for captured discs, whose col,row set to 9,9
    // TODO cleanup when JailDisc developed
    // this.col < 8 && this.ctx.translate(this.center.x, this.center.y)

    this.ctx.translate(this.center.x, this.center.y)

    this.ctx.beginPath()
    this.ctx.arc(0, 0, this.radius, 0, 2*Math.PI)
    
    // Style disc fill and shadow according to disc type: ghost, red, or black
    if (this.isGrabbed) {
      this.ctx.shadowColor = 'hsla(0, 0%, 0%, 0.9)'
      this.ctx.shadowBlur = (25 / 40) * this.radius
      this.ctx.shadowOffsetY = this.radius * 0.6
    } else {
      this.ctx.shadowColor = 'hsla(0, 0%, 0%, 0.8)'
      this.ctx.shadowBlur = (6 / 40) * this.radius
      this.ctx.shadowOffsetY = this.radius * 0.07
    }

    if (this.color === CONSTANTS.RED || this.color === CONSTANTS.BLACK) {
      this.ctx.fillStyle = this.color === CONSTANTS.RED
        ? 'crimson'
        : 'black'
      this.ctx.fill()
      this.ctx.shadowColor = this.ctx.shadowBlur = this.ctx.shadowOffsetY = null
    }
    
    // Outer circle inside of ridged perimeter
    this.ctx.moveTo(0.8 * this.radius, 0)
    this.ctx.arc(0, 0, 0.8 * this.radius, 0, 2*Math.PI)
    
    // Outer ridges
    const numRidges = 48
    this.ctx.save()
    for (let i = 0; i < numRidges; i++) {
      this.ctx.rotate(2*Math.PI/numRidges)
      this.ctx.moveTo(0.85 * this.radius, 0)
      this.ctx.lineTo(0.95 * this.radius, 0)
    }
    this.ctx.restore()

    this.ctx.strokeStyle = this.strokeColor
    // Adjust for differential contrast between dark on light versus light on dark lines
    this.ctx.lineWidth = this.color === CONSTANTS.RED ? 1 : 0.9 
    this.ctx.stroke()

    // Inner designs
    this.ctx.beginPath()    // allow for kingColor strokes
    this.ctx.strokeStyle = this.isKing ? periodicColor() : this.strokeColor

    const numInlays = 8
    this.ctx.save()       // save C - inside outer draw loop
    for (let i = 0; i < numInlays; i++) {
      this.ctx.rotate(2*Math.PI/numInlays)

      // Outer and encircled small circle
      this.ctx.moveTo(0.575 * this.radius, 0)
      this.ctx.arc(0.525 * this.radius, 0, 0.05 * this.radius, 0, 2*Math.PI)
      
      // Arc outer to small circle
      this.ctx.save()
      this.ctx.translate(0.5 * this.radius, 0)
      this.ctx.rotate(-Math.PI*6/12)
      this.ctx.moveTo(0.225 * this.radius, 0)
      this.ctx.arc(0, 0, 0.225 * this.radius, 0, Math.PI)
      this.ctx.restore()
      
      // Line details 'round small circle
      this.ctx.save()
      this.ctx.translate(0.525 * this.radius, 0)
      this.ctx.rotate(Math.PI*-10/12)
      for (let i = 0; i < 3; i++) {
        this.ctx.rotate(Math.PI*5/12)
        this.ctx.moveTo(0.1 * this.radius, 0)
        this.ctx.lineTo(0.15 * this.radius, 0)
      }
      this.ctx.restore()
      
      // Details just within solid outer circle
      this.ctx.save()
      this.ctx.rotate(Math.PI/numInlays)
      this.ctx.moveTo(0.675 * this.radius, 0)
      this.ctx.lineTo(0.75 * this.radius, 0)
      this.ctx.rotate(Math.PI/24)
      this.ctx.moveTo(0.725 * this.radius, 0)
      this.ctx.lineTo(0.75 * this.radius, 0)
      this.ctx.rotate(-2*Math.PI/24)
      this.ctx.moveTo(0.725 * this.radius, 0)
      this.ctx.lineTo(0.75 * this.radius, 0)
      this.ctx.restore()
    }

    this.ctx.restore()    
    
    // Arc encompassing disc center
    this.ctx.save()
    for (let i = 0; i < numInlays; i++) {
      this.ctx.rotate(2*Math.PI/numInlays)
      this.ctx.save()
      if (this.isKing) {
        this.ctx.rotate(Math.floor(animateStep() / 60) * 2 * Math.PI / 180)
        }
      this.ctx.translate((9 / 40) * this.radius, 0)
      this.ctx.rotate(Math.PI*3/12)
      this.ctx.moveTo((11 / 40) * this.radius,0 )
      this.ctx.arc(0, 0, (11 / 40) * this.radius, 0, Math.PI*18.5/12)
      this.ctx.restore()
    }
    this.ctx.restore()

    this.ctx.stroke()
  }
}