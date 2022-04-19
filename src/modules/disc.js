import { CONSTANTS } from '../main';
import { ctx } from '../main';
import { mouseX, mouseY } from './listeners.js';

export default class Disc {
  #path;
  constructor(row, col, color) {
    if (!(col >= 0 && row >= 0)) {
      throw new TypeError(`A disc's col and row must be initialized`);
    }
    if (!color) {
      throw new TypeError(`A disc must be given a color`);
    }
    this.col = col;
    this.row = row;
    this.id = `${parseInt(row)}${parseInt(col)}`;
    this.color = color;
    this.opposite = color === CONSTANTS.RED ? CONSTANTS.BLACK : CONSTANTS.RED;
    this.isGrabbed = false;
    this.direction = color === CONSTANTS.RED ? 1 : -1;
    this.isKing = true;
    this.animateFrame = 0;
    this.kingColor = `hsl(0, 0%, 0%)`;
  }

  animateStep() {
    // animateFrame, the *2*2.85 is to give high enough animate frame to reach 
    // full range of desired colors in periodicColor
    if (this.animateFrame === 45*60*2*2.85) this.animateFrame = 0;
    return this.animateFrame++;
  }

  periodicColor() {
    if (this.animateFrame % 60 === 0) {
      if (this.color === CONSTANTS.RED) {
        this.kingColor = `hsl(${(Math.floor(this.animateFrame / 30) % 186) + 70}, 100%, 40%)`;
      } else {
        this.kingColor = `hsl(${Math.floor(this.animateFrame / 30) % 256}, 100%, 70%)`;
      }
    }
    return this.kingColor;
  }
  isClicked(x, y) {
    const isInPath = ctx.isPointInPath(this.#path, x, y);
    return isInPath;
  }

  toString() {
    return `Disc @ r,c: ${this.row},${this.col}`;
  }

  toggleGrab() {
    this.isGrabbed = !this.isGrabbed;
  }

  makeKing() {
    this.isKing = true;
  }
  
  draw(ctx) {
    // Draws game piece by referencing a row and column on board
    // or by mouse location relative to board when disc isGrabbed
    let x, y;
    if (this.isGrabbed) {
      x = mouseX;
      y = mouseY;
    } else {
      x = ((this.col) * 100) + 50;
      y = ((this.row) * 100) + 50;

    // Register path for click detection
    // Divergent dimensions from draw compensating for unknown
    // differences between rendered disc and click event coordinates
    // This click path valid only for when disc is at rest and ungrabbed state
    // CSDR: The y offset for the path's center is off by ~3 pixels
      this.#path = new Path2D();
      this.#path.arc(x, y+3, 42, 0, 2*Math.PI);
    }
    
    if (this.color === CONSTANTS.GHOST) {
      ctx.strokeStyle = 'hsl(250, 100%, 60%)';
    } else {
      ctx.strokeStyle = this.color === CONSTANTS.RED ? 'hsl(0,100%,10%)' : 'hsl(0,0%,80%)';
      // Adjust for differential contrast between dark on light versus light on dark lines
      ctx.lineWidth = this.color === CONSTANTS.RED ? 1 : 0.9; 
    }

    // Fill disc
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, 2*Math.PI);
    if (this.color === CONSTANTS.GHOST) {
      ctx.stroke();
    } else {
      ctx.fillStyle = this.color === CONSTANTS.RED ? 'crimson' : 'black';
      ctx.fill();
    }
    
    // Inner circle detail
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, 2*Math.PI);
    ctx.stroke();
    
    // Outer ridges
    const numRidges = 48;
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < numRidges; i++) {
      ctx.rotate(2*Math.PI/numRidges);
      ctx.moveTo(34, 0);
      ctx.lineTo(38, 0);
    }
    ctx.stroke();
    ctx.restore();

    const numInlays = 8;
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < numInlays; i++) {
      ctx.rotate(2*Math.PI/numInlays);

      // Outer and encircled small circle
      ctx.moveTo(23, 0);
      ctx.arc(21, 0, 2, 0, 2*Math.PI);
      
      
      // Arc outer to small circle
      ctx.save();
      ctx.translate(20, 0);
      ctx.rotate(-Math.PI*6/12);
      ctx.moveTo(9, 0);
      ctx.arc(0, 0, 9, 0, Math.PI);
      ctx.restore();
      // ctx.moveTo(20 + 9*Math.cos(-Math.PI*6/12), 9*Math.sin(-Math.PI*6/12));
      // ctx.arc(20, 0, 9, -Math.PI*6/12, Math.PI*6/12);
      
      // Line details 'round small circle
      ctx.save();
      ctx.translate(21, 0);
      ctx.rotate(Math.PI*-10/12);
      for (let i = 0; i < 3; i++) {
        ctx.rotate(Math.PI*5/12);
        ctx.moveTo(4, 0);
        ctx.lineTo(6, 0);
      }
      ctx.restore();
      
      // Details just within solid outer circle
      ctx.save();
      ctx.rotate(Math.PI/numInlays);
      ctx.moveTo(27, 0);
      ctx.lineTo(30, 0);
      ctx.rotate(Math.PI/24);
      ctx.moveTo(29, 0);
      ctx.lineTo(30, 0);
      ctx.rotate(-2*Math.PI/24);
      ctx.moveTo(29, 0);
      ctx.lineTo(30, 0);
      ctx.restore();
    }
    ctx.strokeStyle = this.color === CONSTANTS.RED ? 'hsl(0,100%,10%)' : 'hsl(0,0%,80%)';
    // ctx.stroke();
    
    // Arc encompassing disc center
    for (let i = 0; i < numInlays; i++) {
      ctx.rotate(2*Math.PI/numInlays);
      ctx.save();
      if (this.isKing) {
        ctx.rotate(Math.floor(this.animateStep() / 60) * 2 * Math.PI / 180);
        }
      ctx.translate(9, 0);
      ctx.rotate(Math.PI*3/12);
      ctx.moveTo(11,0);
      ctx.arc(0, 0, 11, 0, Math.PI*18/12);
      // ctx.stroke();
      ctx.restore();
    }
    if (this.isKing) {
      ctx.strokeStyle = this.periodicColor();
    }
    ctx.stroke();
    ctx.restore();
    ctx.restore();
  }
}
