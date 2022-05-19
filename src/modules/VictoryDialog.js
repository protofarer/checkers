import { CONSTANTS, resetGame, startGame } from '../main'
import Button from './Button'

export default class VictoryDialog {
  // Stops and Starts the play loop
  // CSDR removing start stop and letting draw run in background
  // for simplicity sake, after playing with this approach
  constructor(game, match) {
    this.game = game
    this.match = match

    this.match.gameNo++
    this.game.winner === CONSTANTS.RED
      ? this.match.score.red++
      : this.match.score.black++

    this.size = {
      w: 600,
      h: 400
    }
    this.offset = {
      x: 100,
      y: 200,      
    }
      
    this.pos = {
      top: 200,
      left: 200,
      right: this.offset.x + this.size.w,
      bottom: this.offset.y + this.size.h
    } 

    // TODO turn into HTML
    // Add "start next game"
    const nextGameButtonData = {
      origin: {
        x: 200,
        y: 350,
      },
      label: 'Next Game',
      base: {
        w: 110
      }
    }
    this.nextGameButton = new Button(
      this.game.ctx,
      nextGameButtonData
    )
    // origin of dialog is offset for buttons
    this.nextGameButton.setClickArea(this.offset)
    this.nextGameButton.addClickListener(
      () => { resetGame(); startGame(); },
      { once: true}
    )
    // Add "quit checkers"
    // Add "start new match"
    this.draw()
  }

  draw() {
    this.game.ctx.save()
    this.game.ctx.translate(this.offset.x, this.offset.y)

    this.game.ctx.beginPath()
    this.game.ctx.fillStyle = 'hsla(0, 0%, 95%, 0.75)'
    this.game.ctx.fillRect(0, 0, this.size.w, this.size.h)

    this.game.ctx.font = 'bold 60px Arial'
    
    this.game.ctx.fillStyle = this.game.winner === CONSTANTS.RED 
      ? 'crimson'
      : 'black'

    this.game.ctx.fillText(
      `${this.game.winner === CONSTANTS.RED ? 'RED' : 'BLACK'}`,
      200, 100
    )
    this.game.ctx.fillStyle = 'green'
    this.game.ctx.fillText(
      'WINS!',
      200, 155
    )

    this.game.ctx.font = 'bold 20px Arial'
    this.game.ctx.decoration = 'underlined'
    this.game.ctx.fillStyle = 'black'
    this.game.ctx.fillText(
      `Game ${this.match.gameNo} of ${this.match.gamesPerMatch}`,
      200, 200
    )

    this.game.ctx.font = 'bold 20px Arial'
    this.game.ctx.fillStyle = 'crimson'
    this.game.ctx.fillText(
      `RED: ${this.match.score.red}`,
      200, 250
    ) 
    this.game.ctx.fillStyle = 'black'
    this.game.ctx.fillText(
      `BLACK: ${this.match.score.black}`,
      200, 300
    )
    this.nextGameButton.draw()

    this.game.ctx.restore()
  }
}