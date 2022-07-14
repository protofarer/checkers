import CONSTANTS from '../Constants'
import BaseDisc from './BaseDisc'

export default class BoardDisc extends BaseDisc{

    clickArea = {
      center: {
        x: 0, y: 0,
      },
      radius: 0, lineWidth: 0,
      top: 0, bottom: 0, left: 0, right: 0,
    }
    isGrabbed = false
    // debug helpers, points to drawArea relative to canvas
    drawArea = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    }

  constructor(canvas, row, col, offset, color) {
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
    super(canvas, color)

    this.row = row
    this.col = col
    this.id = `${parseInt(this.col)}${parseInt(this.row)}`
    this.direction = color === CONSTANTS.RED ? 1 : -1

    // Offset produced by baseboard and other objects within canvas
    // TODO refactor offset out, let board/game handle it
    this.offset = offset

    // TODO make relative to board or board squares
    this.radius = 40

    this.updateDiscGeometry()
  }

  updateDiscGeometry() {
    // Disc center wrt canvas
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

  isClicked(pointerCanvasX, pointerCanvasY) {
    return this.ctx.isPointInPath(this.perimeter, pointerCanvasX, pointerCanvasY, 'nonzero')
  }

  toString() {
    return `Disc @ r,c: ${this.row},${this.col}`
  }

  toggleGrab() {
    this.isGrabbed = !this.isGrabbed
    return this.isGrabbed
  }
  
  draw(canvasX=null, canvasY=null) {
    // Draws game piece by referencing a row and column on board
    // or by mouse location relative to canvas (canvasX,Y) when disc isGrabbed


    // VIGIL possible floating point evaluation of (decimal) * radius
    // may result in unexpected behavior.
    if (this.isGrabbed) {
      if (!canvasX || !canvasY) console.error('No coords supplied for drawing grabbed disc')
      this.center = { x: canvasX, y: canvasY }
    } 

    super.draw(this.center)

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
