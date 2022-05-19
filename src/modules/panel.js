import { CONSTANTS } from '../main'
import Button from './Button'
import ReactiveButton from './ReactiveButton'
export default class Panel {
  constructor (offset, dims, game) {
    // All distances and lengths are in pixels, unfortunately for now
    this.drawableChildren = []
    this.game = game

    // Panel Origin
    this.offset = {
      x: offset.x,
      y: offset.y
    }

    this.width = dims.w
    this.height = dims.h
    this.centerX = this.width / 2
    this.centerY = this.height / 2

    // Define vertical separation for all vertically aligned items
    this.verticalAlignmentGap = 280

    this.separatorVerticalGap = this.verticalAlignmentGap
    this.separatorUpperY = this.centerY - this.separatorVerticalGap/2
    this.separatorLowerY = this.centerY + this.separatorVerticalGap/2
    
    this.redJailOffsetX = 20   // relative to panel origin
    this.redJailOffsetY = 20  // relative to panel origin

    this.blackJailOffsetX = 20
    this.blackJailOffsetY = this.height - 20

    this.turnIndicatorX = this.centerX - 75
    this.turnIndicatorCenterY = this.centerY
    this.turnIndicatorVerticalGap = this.separatorVerticalGap + 84
    
    // **********************************************************************
    // ********************   Reset Button
    // **********************************************************************
    const resetButtonData = {
      origin: {
        x: this.centerX - 35,
        y: this.separatorLowerY - 30 - 15,    // button height and gap
      },
      label: 'Reset'
    }
    this.resetButton = new Button(
      this.game.ctx, 
      resetButtonData,
    )
    this.resetButton.setClickArea(this.offset)
    this.drawableChildren.push(this.resetButton)

    function reactTurnColor(game, playerColor) {
      return (button) => {
        game.ctx.font = '16px Arial'
        if (game.turnColor === playerColor) {
          button.labelColor = 'blue'
        } else {
          button.labelColor = 'grey'
        }
      }
    }
    // **********************************************************************
    // ********************   Pass Buttons
    // **********************************************************************
    const passButtonsVerticalGap = this.separatorVerticalGap + 84
    const passButtonDims = { w: 70, h: 30 }

    // **********************************************************************
    // ********************   Red Pass Button
    // **********************************************************************
    const redPassButtonData = {
      origin: {
        x: this.centerX - passButtonDims.w/2,
        y: this.centerY - passButtonsVerticalGap/2 - passButtonDims.h/2
      },
      label: 'Pass',
    }
    this.redPassButton = new ReactiveButton(
      this.game.ctx, 
      redPassButtonData,
      reactTurnColor(game, CONSTANTS.RED)
    )
    this.redPassButton.setClickArea(this.offset)
    this.drawableChildren.push(this.redPassButton)

    // **********************************************************************
    // ********************   Black Pass Button
    // **********************************************************************
    const blackPassButtonData = {
      origin: {
        x: this.centerX - passButtonDims.w/2,
        y: this.centerY + passButtonsVerticalGap/2 - passButtonDims.h/2
      },
      label: 'Pass',
    }
    this.blackPassButton = new ReactiveButton(
      this.game.ctx, 
      blackPassButtonData,
      reactTurnColor(game, CONSTANTS.BLACK)
    )
    this.blackPassButton.setClickArea(this.offset)
    this.drawableChildren.push(this.blackPassButton)

    // **********************************************************************
    // ********************   Turn Indicators
    // **********************************************************************
    this.turnIndicatorColor = 'hsl(100, 100%, 45%)'
    this.turnIndicatorRadius = 8

    // **********************************************************************
    // ********************   Informational Messssage Area
    // **********************************************************************
    this.gameInfo = document.createElement('div')
    this.gameInfo.style.position = 'absolute'
    this.gameInfo.style.left = `${offset.x + 15}px`
    this.gameInfo.style.top = `${this.separatorUpperY + 15}px`
    this.gameInfo.style.height = `${this.verticalAlignmentGap - 65}px`
    this.gameInfo.style.width = `${this.width - 20}px`
    this.gameInfo.style.fontFamily = 'Arial'
    // this.gameInfo.style.border = '1px solid blue'
    document.body.appendChild(this.gameInfo)
    this.gameInfo.innerHTML = `\
      <span>Turn ${this.game.turnCount} </span><br /><br />
      <span style="color: blue;">${this.game.msg}</span>
      `
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
    // **********************************************************************
    // ********************   PANEL
    // **********************************************************************
    // Topmost panel container
    this.game.ctx.save()
    this.game.ctx.translate(this.offset.x, this.offset.y)

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
    this.game.ctx.moveTo(this.turnIndicatorX + this.turnIndicatorRadius, this.turnIndicatorCenterY - this.turnIndicatorVerticalGap/2)
    this.game.ctx.arc(
      this.turnIndicatorX, 
      this.turnIndicatorCenterY - this.turnIndicatorVerticalGap/2, 
      this.turnIndicatorRadius, 0, 2*Math.PI
    )
    this.game.ctx.stroke()

    // Black's empty turn indicator
    this.game.ctx.moveTo(this.turnIndicatorX + this.turnIndicatorRadius, this.turnIndicatorCenterY + this.turnIndicatorVerticalGap/2)
    this.game.ctx.arc(
      this.turnIndicatorX, 
      this.turnIndicatorCenterY + this.turnIndicatorVerticalGap/2,
      this.turnIndicatorRadius, 0, 2*Math.PI)
    this.game.ctx.lineWidth = 1
    this.game.ctx.stroke()

    this.game.ctx.beginPath()
    this.game.turnColor === CONSTANTS.RED
      ? this.game.ctx.arc(this.turnIndicatorX, this.turnIndicatorCenterY - this.turnIndicatorVerticalGap/2, this.turnIndicatorRadius - 1, 0, 2*Math.PI)
      : this.game.ctx.arc(this.turnIndicatorX, this.turnIndicatorCenterY + this.turnIndicatorVerticalGap/2, this.turnIndicatorRadius - 1, 0, 2*Math.PI)
    this.game.ctx.fillStyle = this.turnIndicatorColor
    this.game.ctx.fill()

    // **********************************************************************
    // ********************   PANEL COMPONENTS
    // **********************************************************************
    this.drawCapturedDiscs()
    this.drawableChildren.forEach(c => c.draw())
    this.game.debugMode && this.drawDebugJail()
    this.gameInfo.innerHTML = `\
      <span>Turn ${this.game.turnCount} </span><br /><br />
      <span style="color: blue;">${this.game.msg}</span>
      `

    // Restore from Panel Offset
    this.game.ctx.restore()
  }
}
