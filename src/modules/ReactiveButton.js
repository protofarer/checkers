// import { CONSTANTS } from '../main'
import Button from './Button'

export default class ReactiveButton extends Button {
  // A button that changes its style in response to
  // a change in some state variable
  //    f: acts on prop and changes something
  //      about the button's draw, eg fill color for text
  constructor(
    ctx, origin, label, 
    stretchWidth=1, stretchHeight=1, baseWidth=70, baseHeight=30, 
    fn
  ) {
    super(ctx, origin, label, stretchWidth, stretchHeight, baseWidth, baseHeight)
    this.fn = fn
  }
  
  draw() {
    this.fn(this)
    super.draw()
  }
}

// EG. function statement or express? (reg fn or arrow?)
// const redPass = new ReactiveButton(game, 'turnColor', (obj, propName) => {
//   if (obj[propName] === CONSTANTS.RED) {
//    this.labelColor = 'blue'
//   } else {
//     this.labelColor = 'black'
//   }
// })