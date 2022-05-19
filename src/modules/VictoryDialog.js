import { CONSTANTS } from '../main'

export default class VictoryDialog {
  constructor(game) {
    this.game = game
    this.draw()

    // TODO turn into HTML
    // Add score
    // Add "start next game"
    // Add "quit checkers"
    // Add "start new match"
  }

  draw() {
    this.game.ctx.beginPath()
    this.game.ctx.fillStyle = 'hsla(0, 0%, 95%, 0.75)'
    this.game.ctx.fillRect(100, 200, 600, 400)

    this.game.ctx.font = 'bold 60px Arial'
    
    this.game.ctx.fillStyle = this.game.winner === CONSTANTS.RED 
      ? 'crimson'
      : 'black'
    this.game.ctx.fillText(
      `${this.game.winner === CONSTANTS.RED ? 'RED' : 'BLACK'}`,
      300, 350
    )

    this.game.ctx.fillStyle = 'green'
    this.game.ctx.fillText(
      'WINS!',
      300, 425
    )
  }
}