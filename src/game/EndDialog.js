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

    // function nextgamebutthandler() {
    //     this.hide()
    //     // console.log(`IN nextbutthandler this.game`, this.game.match)
    //     // console.log(`IN endDialog nextGameButt handler, match`, this.game.match)
    //     this.nextGame()
    // }

    // tmp debug
    // const nextgamebuttonfn = () => console.log('hookie')

    this.nextGameButton = new ModalButton(
      this.game.ctx,
      nextGameButtonData,
      this.offset,
      // () => console.log(`poop`, ),
      
      // () => window.location.replace(
      //   'http://localhost:3000/game/index.html?networkType=local&matchLength=3&privacy=public&red=1&black=1&gameNo=2#debugmode'),
      // nextgamebuttonfn,
      
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
    // function resetmatchbutthandler() {
    //     this.hide()
    //     this.resetMatch()
    // }
    // this.newMatchButton = new ModalButton(
    //   this.game.ctx,
    //   newMatchButtonData,
    //   this.offset,
    //   resetmatchbutthandler.bind(this),
    //   { once: true},
    // )
    // this.modalChildren.push(this.newMatchButton)

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
    
    this.game.match.gameNo++

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

    console.log(`newURL`, newURL)
    window.location.assign(newURL)
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

  draw() {
    if (this.isShown) {
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
        `RED: ${this.game.match.red}`,
        200, 250
      ) 
      this.game.ctx.fillStyle = 'black'
      this.game.ctx.fillText(
        `BLACK: ${this.game.match.black}`,
        200, 300
      )

      if ((this.game.match.gameNo) / this.game.match.matchLength > 0.5) {
        // this.nextGameButton.hide()
        // this.newMatchButton.show()
      } else {
        // this.newMatchButton.hide()
        this.nextGameButton.show()
      }

      this.game.ctx.restore()
    } else {
      console.log(`Attempted to draw EndDialog while isShown=false`, )
    }
  }
}