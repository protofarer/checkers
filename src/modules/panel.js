import { CONSTANTS } from '../main';

export default class Panel {
  constructor (width, height) {
    this.width = width;     // pixels
    this.height = height;   // pixels
  }

  draw(ctx) {
    ctx.beginPath();
    // WARN hardcoded position
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgb(0,0,0,0.5)';
    ctx.strokeRect(805, 0, this.width, this.height);

    // Dividing line between players' respective info subpanels
    ctx.moveTo(815, 400);
    ctx.lineTo(815 + this.width - 20, 400);
    ctx.stroke();
  }
}