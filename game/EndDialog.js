import { CONSTANTS, } from './main'
import ModalButton from './ModalButton'
export default class EndDialog {
  // Stops and Starts the play loop
  // CSDR removing start stop and letting draw run in background
  // for simplicity sake, after playing with this approach
  constructor(game) {
    this.game = game

    this.isShown = false
    this.modalChildren = []

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
      },
      name: 'ED-nextGame',
    }

    this.nextGameButton = new ModalButton(
      this.game.ctx,
      nextGameButtonData,
      this.offset,
      this.nextGame.bind(this),
      { once: true},
    )
    this.modalChildren.push(this.nextGameButton)

    // **********************************************************************
    // ********************   Another Match Button
    // **********************************************************************
    const newMatchButtonData = {
      origin: {
        x: 200,
        y: 350,
      },
      label: 'Start New Match?',
      base: {
        w: 150
      },
      name: 'ED-newMatch'
    }
    this.newMatchButton = new ModalButton(
      this.game.ctx,
      newMatchButtonData,
      this.offset,
      this.resetMatch.bind(this),
      { once: true},
    )
    this.modalChildren.push(this.newMatchButton)

    // Start this and its children initialize hidden
    this.hide()
  }

  resetMatch() {
    this.game.match.red = this.game.match.black = 0
    this.game.match.gameNo = 0
    this.nextGame()
  }

  nextGame() {
    // Load next, new game by replacing URL (no history) with incremented
    //  (or non-incremented eg: restart or debug reset) match search params
    // Accessible via EndDialog button and debugGUI
    console.log(`%cIN nextgame 1st line, match`, 'color:orange', this.game.match)
    
    if (this.game.winner !== CONSTANTS.BLANK) {
      this.game.match.gameNo++
    }

    // Use window instead of document: https://stackoverflow.com/questions/2430936/whats-the-difference-between-window-location-and-document-location-in-javascrip
    const currURL = new URL(window.location.href)
    const currDebugMode = window.location.hash
    let nextSearchParams = new URLSearchParams(currURL.search)

    for (let k of nextSearchParams.keys()) {
      nextSearchParams.set(k, this.game.match[k])
      // console.log(`setting nextSearchParams`,k, this.game.match[k] )
    }
    const newURL = location.origin 
      + '/game/index.html?' 
      + nextSearchParams.toString()
      + currDebugMode

    if (this.game.winner === CONSTANTS.BLANK) {
      // DRAW, reset state
      // WARN problematic in so far as no new information is recorded for
      //  draws, eg in the future, should system keep track of an 
      //  account's games played, draws would have to be recorded
      //  to the account as soon as they are decided and have little impact
      //  elsewhere.
      //
      //  Also, the URL for games has yet to be robustly schemed out
      //
      //  Will cause bugs when there is incidental diff in location.hash
      //  due to debugmode activation.
      window.location.reload()
    }
    window.location.replace(newURL)
  }

  hide() {
    // This Modal Dialog must stop drawing when in a hidden state 
    this.isShown = false
    this.modalChildren.forEach(c => {
      c.isShown && c.hide()
    })
  }

  show() {
    // This Modal Dialog start drawing in shown state 
    // (setup as needed)
    this.isShown = true
    this.draw()
  }

  drawEndOfGame() {
    this.game.ctx.fillStyle = this.game.winner === CONSTANTS.RED 
      ? 'crimson'
      : this.game.winner === CONSTANTS.BLACK
        ? 'black'
        : 'grey'
    this.game.ctx.fillText(
      `${this.game.winner === CONSTANTS.RED 
          ? 'RED' 
          : this.game.winner === CONSTANTS.BLACK 
            ? 'BLACK'
            : 'DRAW'
        }`,
      200, 100
    )
    if (this.game.winner !== CONSTANTS.BLANK) {
      this.game.ctx.fillStyle = 'green'
      if (
        this.game.match.red === Math.ceil(this.game.match.matchLength / 2) ||
        this.game.match.black === Math.ceil(this.game.match.matchLength / 2)
      ) {
        this.game.ctx.font = 'bold 48px Arial'
        this.game.ctx.fillText(
          'WINS Game and Match!',
          25, 155
        )
        } else {
          this.game.ctx.fillText(
            'WINS!',
            200, 155
          )
        }
    }
  }

  draw() {
    if (this.isShown) {
      this.game.ctx.save()
      this.game.ctx.translate(this.offset.x, this.offset.y)

      this.game.ctx.beginPath()
      this.game.ctx.fillStyle = 'hsla(0, 0%, 95%, 0.75)'
      this.game.ctx.fillRect(0, 0, this.size.w, this.size.h)

      this.game.ctx.font = 'bold 60px Arial'
      
      this.drawEndOfGame()

      // Present Game Number
      this.game.ctx.font = 'bold 20px Arial'
      this.game.ctx.decoration = 'underlined'
      this.game.ctx.fillStyle = 'black'
      this.game.ctx.fillText(
        `End of Game ${this.game.match.gameNo} of ${this.game.match.matchLength}`,
        200, 200
      )

      // Present Score Summary
      this.game.ctx.font = 'bold 20px Arial'
      this.game.ctx.fillStyle = 'crimson'
      this.game.ctx.fillText(
        `RED: ${this.game.match.red}`,
        200, 250
      ) 
      this.game.ctx.fillStyle = 'black'
      this.game.ctx.fillText(
        `BLACK: ${this.game.match.black}`,
        200, 300
      )

      // Present appropriate action
      if ((this.game.match.gameNo) / this.game.match.matchLength > 0.5
        && Math.abs(this.game.match.red - this.game.match.black) > 0) {
        this.newMatchButton.show()
      } else {
        this.nextGameButton.show()
      }
      this.game.ctx.restore()
    } else {
      console.log(`Attempted to draw EndDialog while isShown=false`, )
    }
  }
}