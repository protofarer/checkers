import { CONSTANTS } from '../main'
import Button from './Button'

export default class ReactiveButton extends Button {
  // A button that changes its style in response to
  // a change in some state variable
  //    f: acts on prop and changes something
  //      about the button's draw, eg fill color for text
  constructor(
    ctx, origin, label, 
    stretchWidth=1, stretchHeight=1, baseWidth=70, baseHeight=30, 
    obj, propName, f
  ) {
    super(ctx, origin, label, stretchWidth, stretchHeight, baseWidth, baseHeight)

    this.obj = obj
    this.propName = propName

    this.f = f
  }
  
  draw() {
    // If obj is passed by reference, then every time draw() is invoked
    // f() shouild act on the latest obj and specified prop
    this.f(this.obj, this.propName)
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