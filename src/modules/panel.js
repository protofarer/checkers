import { CONSTANTS } from '../main'
import Button from './Button'
export default class Panel {
  constructor (offsetX, offsetY, width, height, ctx) {
    // All distances and lengths are in pixels, unfortunately for now
    this.ctx = ctx
    this.drawableChildren = []

    // Panel Origin
    this.offsetX = offsetX
    this.offsetY = offsetY

    this.width = width
    this.height = height
    this.centerX = this.width / 2
    this.centerY = this.height / 2

    this.separatorUpperY = this.centerY - 38
    this.separatorLowerY = this.centerY + 38
    
    this.redJailOffsetX = 20   // relative to panel origin
    this.redJailOffsetY = 20  // relative to panel origin

    this.blackJailOffsetX = 20
    this.blackJailOffsetY = this.height - 20

    this.turnIndicatorX = this.centerX - 75
    this.turnIndicatorY = this.centerY
    
    this.resetButtonX = this.centerX - 40
    this.resetButtonY = this.centerY - 15
    this.resetButton = new Button(
      this.ctx, 
      { x: this.offsetX + this.resetButtonX, 
        y: this.offsetY + this.resetButtonY },
      'Reset'
    )
    this.drawableChildren.push(this.resetButton)

    this.redPassButtonX = this.centerX - 40
    this.redPassButtonY = this.centerY - 90
    this.redPassButton = new Button(
      this.ctx, 
      { x: this.offsetX + this.redPassButtonX, 
        y: this.offsetY + this.redPassButtonY, },
      'Pass'
    )
    this.drawableChildren.push(this.redPassButton)

    this.blackPassButtonX = this.centerX - 40
    this.blackPassButtonY = this.centerY + 60
    this.blackPassButton = new Button(
      this.ctx, 
      { x: this.offsetX + this.blackPassButtonX, 
        y: this.offsetY + this.blackPassButtonY, },
      'Pass'
    )
    this.drawableChildren.push(this.blackPassButton)
  }
  
  drawPassButton(x, y, playerColor, turnColor) {
    this.ctx.shadowColor = 'hsla(0, 0%, 0%, 0.7)'
    this.ctx.shadowBlur = 7
    this.ctx.shadowOffsetY = 5

    this.ctx.beginPath()
    this.ctx.lineWidth = 1
    this.ctx.strokeStyle = 'black'
    this.ctx.fillStyle = 'hsl(0,0%,80%)'
    this.ctx.fillRect(x, y, 70, 30)

    this.ctx.shadowColor = this.ctx.shadowBlur = this.ctx.shadowOffsetY = null

    this.ctx.strokeRect(x-1, y-1,71,31)
    
    this.ctx.font = '16px Arial'
    turnColor === playerColor
      ? this.ctx.fillStyle = 'blue'
      : this.ctx.fillStyle = 'grey'
    this.ctx.fillText('Pass', x + 17, y + 21)
  }

  drawAll({captures, turnColor}) {
    this.draw({captures, turnColor})
    this.drawCapturedDiscs(captures)
    this.drawableChildren.forEach(c => c.draw())
  }

  draw({ captures, turnColor }) {
    this.ctx.save()
    this.ctx.translate(this.offsetX, this.offsetY)


    // Topmost panel container
    this.ctx.beginPath()
    this.ctx.lineWidth = 1
    this.ctx.strokeStyle = 'rgb(0,0,0,0.5)'
    this.ctx.strokeRect(0, 2, this.width - 2, this.height - 4)

    // Dividing line between players' respective info subpanels
    this.ctx.moveTo(15, this.separatorUpperY)
    this.ctx.lineTo(15 + this.width - 30, this.separatorUpperY)
    this.ctx.moveTo(15, this.separatorLowerY)
    this.ctx.lineTo(15 + this.width - 30, this.separatorLowerY)

    // Draw red's jail
    this.ctx.font = '16px Arial'
    this.ctx.fillStyle = 'black'
    this.ctx.fillText(
      `Blacks captured: ${captures.forRed}`, 
      this.redJailOffsetX, 
      this.redJailOffsetY
    )

    // Draw black's jail
    this.ctx.fillText(
      `Reds captured: ${captures.forBlack}`, 
      this.blackJailOffsetX, 
      this.blackJailOffsetY + 12
    )

    // Red's empty turn indicator
    this.ctx.moveTo(this.turnIndicatorX + 16, this.turnIndicatorY - 75)
    this.ctx.arc(
      this.turnIndicatorX, 
      this.turnIndicatorY - 75, 
      16, 0, 2*Math.PI
    )
    this.ctx.stroke()

    // Black's empty turn indicator
    this.ctx.moveTo(this.turnIndicatorX + 16, this.turnIndicatorY + 75)
    this.ctx.arc(
      this.turnIndicatorX, 
      this.turnIndicatorY + 75,
      16, 0, 2*Math.PI)
    this.ctx.lineWidth = 1
    this.ctx.stroke()

    this.ctx.beginPath()
    turnColor === CONSTANTS.RED
      ? this.ctx.arc(this.turnIndicatorX, this.centerY - 75, 15, 0, 2*Math.PI)
      : this.ctx.arc(this.turnIndicatorX, this.centerY + 75, 15, 0, 2*Math.PI)
    this.ctx.fillStyle = 'hsl(100, 50%, 50%)'
    this.ctx.fill()

    this.ctx.restore()
  }

  drawCapturedDiscs(captures) {
    const scaleRatio = 0.5
    const horizontalOffset = 100
    const verticalOffset = 100

    this.ctx.save()
    this.ctx.translate(this.offsetX + this.centerX, 0)

    const redJailTop = 45
    this.ctx.save()
    this.ctx.translate(-50, redJailTop)
    this.ctx.scale(scaleRatio, scaleRatio)
    captures.capturedBlacks.forEach((disc, ndx) => {
      if (ndx > 0 && ndx % 3 === 0) {
        this.ctx.translate(-3 * horizontalOffset,verticalOffset)
      }
      disc.draw()
      this.ctx.translate(horizontalOffset, 0)
    })
    this.ctx.restore()

    const blackJailBottom = this.height - 45
    this.ctx.save()
    this.ctx.translate(-50, blackJailBottom)
    this.ctx.scale(scaleRatio, scaleRatio)
    captures.capturedReds.forEach((disc, ndx) => {
      if (ndx > 0 && ndx % 3 === 0) {
        this.ctx.translate(-3 * horizontalOffset, -verticalOffset)
      }
      disc.draw()
      this.ctx.translate(horizontalOffset, 0)
    })
    this.ctx.restore()

    this.ctx.restore()
  }
}
