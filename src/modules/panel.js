import { CONSTANTS } from '../main'
import Button from './Button'
import ReactiveButton from './ReactiveButton'
export default class Panel {
  constructor (offsetX, offsetY, width, height, game) {
    // All distances and lengths are in pixels, unfortunately for now
    this.drawableChildren = []
    this.game = game

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
      this.game.ctx, 
      { x: this.resetButtonX, 
        y: this.resetButtonY },
      'Reset'
    )
    this.drawableChildren.push(this.resetButton)

    this.redPassButtonX = this.centerX - 40
    this.redPassButtonY = this.centerY - 90

    function passButtonColor(playerColor) {
      return (game, turnColor) => {
        this.ctx.font = '16px Arial'
        turnColor === playerColor
          ? this.game.ctx.fillStyle = 'blue'
          : this.game.ctx.fillStyle = 'grey'
        this.game.ctx.fillText('Pass', this.origin.x + 17, this.origin.y + 21)
      }
    }

    this.redPassButton = new ReactiveButton(
      this.game.ctx, 
      { x: this.redPassButtonX, 
        y: this.redPassButtonY, },
      'Pass',
      this.game,
      'turnColor',
      passButtonColor(CONSTANTS.RED)
    )
    this.drawableChildren.push(this.redPassButton)

    this.blackPassButtonX = this.centerX - 40
    this.blackPassButtonY = this.centerY + 60
    this.blackPassButton = new Button(
      this.game.ctx, 
      { x: this.blackPassButtonX, 
        y: this.blackPassButtonY, },
      'Pass'
    )
    this.drawableChildren.push(this.blackPassButton)
  }

  drawDebugJail() {
    // Draw red's jail
    this.game.ctx.beginPath()
    this.game.ctx.font = '16px Arial'
    this.game.ctx.fillStyle = 'black'
    this.game.ctx.fillText(
      `Blacks captured: ${this.game.captures.forRed}`, 
      this.redJailOffsetX, 
      this.redJailOffsetY
    )

    // Draw black's jail
    this.game.ctx.fillText(
      `Reds captured: ${this.game.captures.forBlack}`, 
      this.blackJailOffsetX, 
      this.blackJailOffsetY + 12
    )
    this.game.ctx.restore()
  }
  
  // drawPassButton(x, y, playerColor) {
  //   this.game.ctx.shadowColor = 'hsla(0, 0%, 0%, 0.7)'
  //   this.game.ctx.shadowBlur = 7
  //   this.game.ctx.shadowOffsetY = 5

  //   this.game.ctx.beginPath()
  //   this.game.ctx.lineWidth = 1
  //   this.game.ctx.strokeStyle = 'black'
  //   this.game.ctx.fillStyle = 'hsl(0,0%,80%)'
  //   this.game.ctx.fillRect(x, y, 70, 30)

  //   this.game.ctx.shadowColor = this.game.ctx.shadowBlur = this.game.ctx.shadowOffsetY = null

  //   this.game.ctx.strokeRect(x-1, y-1,71,31)
    
  //   this.game.ctx.font = '16px Arial'
  //   this.game.turnColor === playerColor
  //     ? this.game.ctx.fillStyle = 'blue'
  //     : this.game.ctx.fillStyle = 'grey'
  //   this.game.ctx.fillText('Pass', x + 17, y + 21)
  // }

  drawCapturedDiscs() {
    const scaleRatio = 0.5
    const horizontalOffset = 100
    const verticalOffset = 100

    const redJailTop = 45
    this.game.ctx.save()
    this.game.ctx.translate(this.centerX - 50, redJailTop)
    this.game.ctx.scale(scaleRatio, scaleRatio)
    this.game.captures.capturedBlacks.forEach((disc, ndx) => {
      if (ndx > 0 && ndx % 3 === 0) {
        this.game.ctx.translate(-3 * horizontalOffset,verticalOffset)
      }
      disc.draw()
      this.game.ctx.translate(horizontalOffset, 0)
    })
    this.game.ctx.restore()

    const blackJailBottom = this.height - 45
    this.game.ctx.save()
    this.game.ctx.translate(this.centerX - 50, blackJailBottom)
    this.game.ctx.scale(scaleRatio, scaleRatio)
    this.game.captures.capturedReds.forEach((disc, ndx) => {
      if (ndx > 0 && ndx % 3 === 0) {
        this.game.ctx.translate(-3 * horizontalOffset, -verticalOffset)
      }
      disc.draw()
      this.game.ctx.translate(horizontalOffset, 0)
    })
    this.game.ctx.restore()
  }

  draw() {
    // Topmost panel container
    this.game.ctx.beginPath()
    this.game.ctx.lineWidth = 1
    this.game.ctx.strokeStyle = 'rgb(0,0,0,0.5)'
    this.game.ctx.strokeRect(0, 2, this.width - 2, this.height - 4)

    // Dividing line between players' respective info subpanels
    this.game.ctx.moveTo(15, this.separatorUpperY)
    this.game.ctx.lineTo(15 + this.width - 30, this.separatorUpperY)
    this.game.ctx.moveTo(15, this.separatorLowerY)
    this.game.ctx.lineTo(15 + this.width - 30, this.separatorLowerY)

    // Red's empty turn indicator
    this.game.ctx.moveTo(this.turnIndicatorX + 16, this.turnIndicatorY - 75)
    this.game.ctx.arc(
      this.turnIndicatorX, 
      this.turnIndicatorY - 75, 
      16, 0, 2*Math.PI
    )
    this.game.ctx.stroke()

    // Black's empty turn indicator
    this.game.ctx.moveTo(this.turnIndicatorX + 16, this.turnIndicatorY + 75)
    this.game.ctx.arc(
      this.turnIndicatorX, 
      this.turnIndicatorY + 75,
      16, 0, 2*Math.PI)
    this.game.ctx.lineWidth = 1
    this.game.ctx.stroke()

    this.game.ctx.beginPath()
    this.game.turnColor === CONSTANTS.RED
      ? this.game.ctx.arc(this.turnIndicatorX, this.centerY - 75, 15, 0, 2*Math.PI)
      : this.game.ctx.arc(this.turnIndicatorX, this.centerY + 75, 15, 0, 2*Math.PI)
    this.game.ctx.fillStyle = 'hsl(100, 50%, 50%)'
    this.game.ctx.fill()
  }

  drawAll() {
    this.game.ctx.save()
    this.game.ctx.translate(this.offsetX, this.offsetY)

    this.draw()
    this.drawCapturedDiscs()
    this.drawableChildren.forEach(c => c.draw())
    this.game.debugMode && this.drawDebugJail()

    this.game.ctx.restore()
  }
}
