import { CONSTANTS, resetGame, startGame, startNewMatch } from './main'
import Button from './Button'

export default class EndDialog {
  // Stops and Starts the play loop
  // CSDR removing start stop and letting draw run in background
  // for simplicity sake, after playing with this approach
  constructor(game, isDraw=false) {
    this.game = game
    this.isDraw = isDraw

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

    // **********************************************************************
    // ********************   Next Game Button
    // **********************************************************************
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
    this.nextGameButton.setClickArea(this.offset)
    this.nextGameButton.addClickListener(
      () => { 
        resetGame(this.game.debugMode, this.game.debugOverlay) 
        startGame()
      },
      { once: true}
    )

    // **********************************************************************
    // ********************   Another Match Button
    // **********************************************************************
    const anotherMatchButtonData = {
      origin: {
        x: 200,
        y: 350,
      },
      label: 'Start New Match?',
      base: {
        w: 150
      }
    }
    this.anotherMatchButton = new Button(
      this.game.ctx,
      anotherMatchButtonData
    )
    this.anotherMatchButton.setClickArea(this.offset)
    this.anotherMatchButton.addClickListener(
      () => { 
        startNewMatch()
        startGame()
      },
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
      `End of Game ${this.game.match.gameNo} of ${this.game.match.matchLength}`,
      200, 200
    )

    this.game.ctx.font = 'bold 20px Arial'
    this.game.ctx.fillStyle = 'crimson'
    this.game.ctx.fillText(
      `RED: ${this.game.match.score.red}`,
      200, 250
    ) 
    this.game.ctx.fillStyle = 'black'
    this.game.ctx.fillText(
      `BLACK: ${this.game.match.score.black}`,
      200, 300
    )


    if (this.game.match.gameNo / this.game.match.matchLength > 0.5) {
      this.anotherMatchButton.draw()
    } else {
      this.nextGameButton.draw()
    }

    this.game.ctx.restore()
  }
}