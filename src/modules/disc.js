import { CONSTANTS } from '../main';

export default class Disc {
  #path;
  constructor(ctx, row, col, offset, color) {
    if (!(col >= 0 && row >= 0)) {
      throw new TypeError(`A disc's col and row are not initialized`);
    }
    if (!color) {
      throw new TypeError(`A disc was not initialized a color`);
    }
    if (!offset?.x || !offset?.y) {
      throw new TypeError(`A disc's offsets are not initialized`)
    }
    this.ctx = ctx;
    this.id = `${parseInt(col)}${parseInt(row)}`;
    this.col = col;
    this.row = row;
    this.offset = offset;
   
    // Absolute coord of disc center in canvas
    this.center = new (function(row, col, offset) {
      this.x =  ((col) * 100) + 50 + offset.x
      this.y = ((row) * 100) + 50 + offset.y
    })(this.row, this.col, this.offset)

    // this.center = {
    //   x: ((this.col) * 100) + 50 + this.offset.x,
    //   y: ((this.row) * 100) + 50 + this.offset.y
    // }

    this.radius = 40;
    this.color = color;
    this.opposite = color === CONSTANTS.RED ? CONSTANTS.BLACK : CONSTANTS.RED;
    this.direction = color === CONSTANTS.RED ? 1 : -1;
    this.isGrabbed = false;
    
    this.isKing = false;
    this.kingColor = `hsl(0, 0%, 0%)`;
    
    this.animateFrame = 0;

    this.setClickArea();
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
        const colorAngle = (Math.floor(this.animateFrame / 15) % 290) + 30;
        this.kingColor = `hsl(${colorAngle}, 100%, 40%)`;
      } else {
        const colorAngle = Math.floor(this.animateFrame / 15) % 360;
        this.kingColor = `hsl(${colorAngle}, 100%, 70%)`;
      }
    }
    return this.kingColor;
  }

  setClickArea() {
    // const x = ((this.col) * 100) + 50 + this.offset.x;
    // const y = ((this.row) * 100) + 50 + this.offset.y;
    // console.log(`setClickArea centx,y`, this.center.x, this.center.y)
    // console.log(`in setClickArea, offsets`, this.offset)
    
    this.#path = new Path2D();
    this.#path.arc(this.center.x, this.center.y + 3, this.radius + 2, 0, 2 * Math.PI);
  }

  isClicked(x, y) {
    // WARN this if block causes massive performance issues, freezes UI
    // if (this.ctx.isPointInPath(this.#path, x, y, 'nonzero')) {
    //   console.log(`canvasxy inside isclicked`, x, y)
    //   console.log(`Disc ${this.row}, ${this.col} was clicked`)
    // }
    return this.ctx.isPointInPath(this.#path, x, y, 'nonzero');
  }

  toString() {
    return `Disc @ r,c: ${this.row},${this.col}`;
  }

  toggleGrab() {
    this.isGrabbed = !this.isGrabbed;
    // Only calculate click area when disc transitions to being at rest
    // !this.isGrabbed && this.setClickArea()
    return this.isGrabbed;
  }

  makeKing() {
    this.isKing = true;
    return this.isKing;
  }
  
  draw(canvasX, canvasY) {
    // Draws game piece by referencing a row and column on board
    // or by mouse location relative to board when disc isGrabbed

    // VIGIL possible floating point evaluation of (decimal) * radius
    // may result in unexpected behavior.

    const getStrokeStyle = () => {
      return this.color === CONSTANTS.RED ? 'hsl(0,100%,10%)' : 'hsl(0,0%,80%)';
    }
    
    if (this.isGrabbed) {
      this.center = {
        x: canvasX,
        y: canvasY
      }
    } else {
      this.center = {
        x: ((this.col) * 100) + 50 + this.offset.x,
        y: ((this.row) * 100) + 50 + this.offset.y
      }
    // Register path for click detection
    // Divergent dimensions from draw compensating for unknown
    // differences between rendered disc and click event coordinates
    // This click path valid only for when disc is at rest and ungrabbed state
    // CSDR: The y offset for the path's center is off by ~3 pixels
    
  }
  // this.setClickArea()

    this.ctx.save()      // save A - disc center
    this.ctx.translate(this.center.x, this.center.y)
    
    if (this.color === CONSTANTS.GHOST) {
      this.ctx.strokeStyle = 'hsl(250, 100%, 60%)';
    } else {
      this.ctx.strokeStyle = getStrokeStyle(); 
      // Adjust for differential contrast between dark on light versus light on dark lines
      this.ctx.lineWidth = this.color === CONSTANTS.RED ? 1 : 0.9; 
    }

    // *********************************************
    // *******    red shadow jank
    // *********************************************
    // Shadows for red (approach differently because of compositing problem)
    // tmp draw disc shadow
    // first circ offset y -15
    // 2nd offset y +3
    // if (this.color === CONSTANTS.RED) {
    //   if (this.isGrabbed) {
    //     this.ctx.beginPath()
    //     let grad = this.ctx.createRadialGradient(
    //       0, 28, 5,
    //       0, 28, 53)
    //     grad.addColorStop(0,'black')
    //     grad.addColorStop(0.7, 'rgba(0,0,0,.5')
    //     grad.addColorStop(1, 'rgba(0,0,0,0)')
    //     this.ctx.fillStyle = grad
    //     this.ctx.fillRect(-50, -50, 160, 160)

    //   } else {
    //     this.ctx.beginPath()
    //     let grad = this.ctx.createRadialGradient(
    //       0, 15, 10,
    //       0, 3, 45)
    //     grad.addColorStop(0,'black')
    //     grad.addColorStop(0.8, 'rgba(0,0,0,.8')
    //     grad.addColorStop(1, 'rgba(0,0,0,0)')
    //     this.ctx.fillStyle = grad
    //     this.ctx.fillRect(-50, -50, 100, 100)
    //   }
    // }

    // **************************************************************************
    // **********************    Fill Disc and Shadow
    // **************************************************************************

    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.radius, 0, 2*Math.PI);
    
    // Style disc fill and shadow according to disc type: ghost, red, or black
    if (this.isGrabbed) {
      this.ctx.shadowColor = 'hsla(0, 0%, 0%, 0.9)'
      this.ctx.shadowBlur = 25;
      this.ctx.shadowOffsetY = this.radius * 0.6
    } else {
      this.ctx.shadowColor = 'hsla(0, 0%, 0%, 0.8)'
      this.ctx.shadowBlur = 6;
      this.ctx.shadowOffsetY = this.radius * 0.07
    }

    if (this.color === CONSTANTS.GHOST) {
      this.ctx.stroke();
    } else {
      this.ctx.fillStyle = this.color === CONSTANTS.RED
        ? 'crimson'
        : 'black'
    }

    this.ctx.fill();
    this.ctx.shadowColor = this.ctx.shadowBlur = this.ctx.shadowOffsetY = null;
    
    // Inner circle detail
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 0.8 * this.radius, 0, 2*Math.PI);
    this.ctx.stroke();
    
    // Outer ridges
    const numRidges = 48;
    this.ctx.save();
    this.ctx.beginPath();
    for (let i = 0; i < numRidges; i++) {
      this.ctx.rotate(2*Math.PI/numRidges);
      this.ctx.moveTo(0.85 * this.radius, 0);
      this.ctx.lineTo(0.95 * this.radius, 0);
    }
    this.ctx.stroke();
    this.ctx.restore();

    const numInlays = 8;
    this.ctx.save();       // save C - inside outer draw loop
    this.ctx.beginPath();
    for (let i = 0; i < numInlays; i++) {
      this.ctx.rotate(2*Math.PI/numInlays);

      // Outer and encircled small circle
      this.ctx.moveTo(0.575 * this.radius, 0);
      this.ctx.arc(0.525 * this.radius, 0, 0.05 * this.radius, 0, 2*Math.PI);
      
      // Arc outer to small circle
      this.ctx.save();
      this.ctx.translate(0.5 * this.radius, 0);
      this.ctx.rotate(-Math.PI*6/12);
      this.ctx.moveTo(0.225 * this.radius, 0);
      this.ctx.arc(0, 0, 0.225 * this.radius, 0, Math.PI);
      this.ctx.restore();
      
      // Line details 'round small circle
      this.ctx.save();
      this.ctx.translate(0.525 * this.radius, 0);
      this.ctx.rotate(Math.PI*-10/12);
      for (let i = 0; i < 3; i++) {
        this.ctx.rotate(Math.PI*5/12);
        this.ctx.moveTo(0.1 * this.radius, 0);
        this.ctx.lineTo(0.15 * this.radius, 0);
      }
      this.ctx.restore();
      
      // Details just within solid outer circle
      this.ctx.save();
      this.ctx.rotate(Math.PI/numInlays);
      this.ctx.moveTo(0.675 * this.radius, 0);
      this.ctx.lineTo(0.75 * this.radius, 0);
      this.ctx.rotate(Math.PI/24);
      this.ctx.moveTo(0.725 * this.radius, 0);
      this.ctx.lineTo(0.75 * this.radius, 0);
      this.ctx.rotate(-2*Math.PI/24);
      this.ctx.moveTo(0.725 * this.radius, 0);
      this.ctx.lineTo(0.75 * this.radius, 0);
      this.ctx.restore();
    }

    this.ctx.restore()    
    this.ctx.strokeStyle = getStrokeStyle();
    
    // Arc encompassing disc center
    this.ctx.save()
    for (let i = 0; i < numInlays; i++) {
      this.ctx.rotate(2*Math.PI/numInlays);
      this.ctx.save();
      if (this.isKing) {
        this.ctx.rotate(Math.floor(this.animateStep() / 60) * 2 * Math.PI / 180);
        }
      this.ctx.translate(9, 0);
      this.ctx.rotate(Math.PI*3/12);
      this.ctx.moveTo(11,0);
      this.ctx.arc(0, 0, 11, 0, Math.PI*18/12);
      this.ctx.restore();
    }
    this.ctx.restore()

    if (this.isKing) {
      this.ctx.strokeStyle = this.periodicColor();
    }

    this.ctx.stroke();
    this.ctx.restore(); // restore A
  }
}
