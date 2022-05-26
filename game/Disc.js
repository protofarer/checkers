import CONSTANTS from './Constants'

export default class Disc {
  constructor(ctx, row, col, offset, color) {
    // TRY console.assert?
    if (!(col >= 0 && row >= 0)) {
      throw new TypeError('A disc\'s col and row are not initialized')
    }
    if (![CONSTANTS.RED, CONSTANTS.BLACK, CONSTANTS.GHOST].some(ele => color === ele)) {
      throw new TypeError('A disc was not initialized a color')
    }
    if (!offset?.x || !offset?.y) {
      throw new TypeError('A disc\'s offsets are not initialized')
    }
    this.ctx = ctx
    this.id = `${parseInt(col)}${parseInt(row)}`
    this.col = col
    this.row = row

    // Offset produced by baseboard and other objects within canvas
    this.offset = offset

    this.radius = 40
    // Color means disc type rather than rendered color
    this.color = color
    this.opposite = color === CONSTANTS.RED ? CONSTANTS.BLACK : CONSTANTS.RED
    this.direction = color === CONSTANTS.RED ? 1 : -1
    this.isGrabbed = false
    this.isKing = false
    this.kingColor = color === CONSTANTS.RED ? 'crimson' : 'black'
    
    this.animateFrame = 0
    
    // Disc center wrt canvas
    this.center = new (function(row, col, offset) {
      this.x =  ((col) * 100) + 50 + offset.x
      this.y = ((row) * 100) + 50 + offset.y
    })(this.row, this.col, this.offset)

    this.clickArea = {
      center: {
        x: 0,
        y: 0,
      },
      radius: 0,
      lineWidth: 0,
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    }

    // debug helpers, points to drawArea relative to canvas
    this.drawArea = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    }

    this.updateDiscGeometry()
  }

  animateStep() {
    // animateFrame, the *2*2.85 is to give high enough animate frame to reach 
    // full range of desired colors in periodicColor
    if (this.animateFrame === 45*60*2*2.85) this.animateFrame = 0
    return this.animateFrame++
  }

  periodicColor() {
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

  updateDiscGeometry() {
    this.center = new (function(row, col, offset) {
      this.x =  ((col) * 100) + 50 + offset.x
      this.y = ((row) * 100) + 50 + offset.y
    })(this.row, this.col, this.offset)

    this.clickArea = new (function(centerX, centerY, radius) {
      this.center = {
        x: centerX,
        y: centerY
      }
      // ensure clickArea perimeter surrounds disc 
      // with no overlap on disc drawArea
      this.radius = radius + 1 

      this.lineWidth = 1

      // debug helpers, points to clickArea relative to canvas
      this.top = this.center.y - this.radius
      this.bottom = this.center.y + this.radius
      this.left = this.center.x - this.radius
      this.right = this.center.x + this.radius
    })(this.center.x, this.center.y, this.radius)

    // drawArea specifically used for debugging clickArea, so calculate here
    this.drawArea = new (function(centerX, centerY, radius) {
      this.top = centerY - radius
      this.bottom = centerY + radius
      this.left = centerX - radius
      this.right = centerX + radius
    })(this.center.x, this.center.y, this.radius)

    this.perimeter = new Path2D()
    this.perimeter.arc(this.clickArea.center.x, this.clickArea.center.y, this.clickArea.radius, 0, 2 * Math.PI)
  }

  isClicked(mouseCanvasX, mouseCanvasY) {
    return this.ctx.isPointInPath(this.perimeter, mouseCanvasX, mouseCanvasY, 'nonzero')
  }

  toString() {
    return `Disc @ r,c: ${this.row},${this.col}`
  }

  toggleGrab() {
    this.isGrabbed = !this.isGrabbed
    return this.isGrabbed
  }
  
  draw(canvasX=0, canvasY=0) {
    // Draws game piece by referencing a row and column on board
    // or by mouse location relative to board when disc isGrabbed

    // VIGIL possible floating point evaluation of (decimal) * radius
    // may result in unexpected behavior.

    // Strokes adjusted for disc's fill
    const getStrokeStyle = this.color === CONSTANTS.RED 
    ? 'hsl(0,100%,10%)' 
    : 'hsl(0,0%,80%)'
    
    if (this.isGrabbed) {
      this.center = {
        x: canvasX,
        y: canvasY
      }
    } 

    this.ctx.save()      // save A - disc center

    // Don't translate for captured discs, whose col,row set to 9,9
    this.col < 8 && this.ctx.translate(this.center.x, this.center.y)
    
    if (this.color === CONSTANTS.GHOST) {
      this.ctx.strokeStyle = 'hsl(250, 100%, 60%)'
    } else {
      this.ctx.strokeStyle = getStrokeStyle
      // Adjust for differential contrast between dark on light versus light on dark lines
      this.ctx.lineWidth = this.color === CONSTANTS.RED ? 1 : 0.9 
    }

    // **************************************************************************
    // **********************    Fill Disc and Shadow
    // **************************************************************************

    this.ctx.beginPath()
    this.ctx.arc(0, 0, this.radius, 0, 2*Math.PI)
    
    // Style disc fill and shadow according to disc type: ghost, red, or black
    if (this.isGrabbed) {
      this.ctx.shadowColor = 'hsla(0, 0%, 0%, 0.9)'
      this.ctx.shadowBlur = 25
      this.ctx.shadowOffsetY = this.radius * 0.6
    } else {
      this.ctx.shadowColor = 'hsla(0, 0%, 0%, 0.8)'
      this.ctx.shadowBlur = 6
      this.ctx.shadowOffsetY = this.radius * 0.07
    }

    if (this.color === CONSTANTS.GHOST) {
      this.ctx.stroke()
    } else {
      this.ctx.fillStyle = this.color === CONSTANTS.RED
        ? 'crimson'
        : 'black'
    }

    this.ctx.fill()
    this.ctx.shadowColor = this.ctx.shadowBlur = this.ctx.shadowOffsetY = null
    
    // Inner circle detail
    this.ctx.beginPath()
    this.ctx.arc(0, 0, 0.8 * this.radius, 0, 2*Math.PI)
    this.ctx.stroke()
    
    // Outer ridges
    const numRidges = 48
    this.ctx.save()
    this.ctx.beginPath()
    for (let i = 0; i < numRidges; i++) {
      this.ctx.rotate(2*Math.PI/numRidges)
      this.ctx.moveTo(0.85 * this.radius, 0)
      this.ctx.lineTo(0.95 * this.radius, 0)
    }
    this.ctx.stroke()
    this.ctx.restore()

    const numInlays = 8
    this.ctx.save()       // save C - inside outer draw loop
    this.ctx.beginPath()
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
    this.ctx.strokeStyle = getStrokeStyle
    
    // Arc encompassing disc center
    this.ctx.save()
    for (let i = 0; i < numInlays; i++) {
      this.ctx.rotate(2*Math.PI/numInlays)
      this.ctx.save()
      if (this.isKing) {
        this.ctx.rotate(Math.floor(this.animateStep() / 60) * 2 * Math.PI / 180)
        }
      this.ctx.translate(9, 0)
      this.ctx.rotate(Math.PI*3/12)
      this.ctx.moveTo(11,0)
      this.ctx.arc(0, 0, 11, 0, Math.PI*18/12)
      this.ctx.restore()
    }
    this.ctx.restore()

    if (this.isKing) {
      this.ctx.strokeStyle = this.periodicColor()
    }

    this.ctx.stroke()
    this.ctx.restore() // restore A
  }

  drawClickArea(position) {
    this.ctx.beginPath()
    this.ctx.strokeStyle = 'lawngreen'
    this.ctx.stroke(this.perimeter)

    this.ctx.beginPath()
    this.ctx.strokeStyle = position === 'top' ? 'red' : 'white'
    this.ctx.arc(this.clickArea.center.x, this.clickArea.top, 1, 0, 2 * Math.PI)
    this.ctx.stroke()

    this.ctx.beginPath()
    this.ctx.strokeStyle = position === 'bottom' ? 'red' : 'white'
    this.ctx.moveTo(this.clickArea.center.x, this.clickArea.bottom)
    this.ctx.arc(this.clickArea.center.x, this.clickArea.bottom, 1, 0, 2 * Math.PI)
    this.ctx.stroke()

    this.ctx.beginPath()
    this.ctx.strokeStyle = position === 'left' ? 'red' : 'white'
    this.ctx.moveTo(this.clickArea.left, this.clickArea.center.y)
    this.ctx.arc(this.clickArea.left, this.clickArea.center.y, 1, 0, 2 * Math.PI)
    this.ctx.stroke()

    this.ctx.beginPath()
    this.ctx.strokeStyle = position === 'right' ? 'red' : 'white'
    this.ctx.moveTo(this.clickArea.right, this.clickArea.center.y)
    this.ctx.arc(this.clickArea.right, this.clickArea.center.y, 1, 0, 2 * Math.PI)
    this.ctx.stroke()
  }
}
