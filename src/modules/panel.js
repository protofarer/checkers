import { CONSTANTS } from '../main';

export default class Panel {
  constructor (width, height) {
    this.width = width;     // pixels
    this.height = height;   // pixels
  }

  draw(ctx) {
    ctx.beginPath();

    // WARN hardcoded position
    ctx.strokeRect(805, 0, this.width, this.height);
    ctx.strokeStyle = 'rgb(0,0,0)';
    ctx.stroke();
  }
}