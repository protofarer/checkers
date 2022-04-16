import { CONSTANTS } from '../main';

// TODO Panel instances need access to gameState red and black captures
export default class Panel {
  constructor (width, height) {
    this.width = width;     // pixels
    this.height = height;   // pixels
    this.centerX = 800 + 5 + width/2;
    this.centerY = 800/2;
    this.redJailX = 815;
    this.redJailY = 10;
    this.blackJailX = 815;
    this.blackJailY = 410;
  }

  draw(ctx, gameState) {
    ctx.beginPath();
    // WARN hardcoded position
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgb(0,0,0,0.5)';
    ctx.strokeRect(805, 0, this.width, this.height);

    // Dividing line between players' respective info subpanels
    ctx.moveTo(815, 400);
    ctx.lineTo(815 + this.width - 20, 400);
    ctx.stroke();

    ctx.font = '16px serif';
    // Draw red's jail
    ctx.strokeText(`Blacks captured: ${gameState.captures.forRed}`, this.redJailX, this.redJailY);

    // Draw black's jail
    ctx.strokeText(`Reds captured: ${gameState.captures.forBlack}`, this.blackJailX, this.blackJailY);

    if (gameState.turnColor === CONSTANTS.RED) {
      ctx.beginPath();
      // ctx.moveTo(this.centerX - 20, this.centerY + 20);
      ctx.arc(this.centerX - 125, this.centerY - 200, 15, 0, 2*Math.PI);
      ctx.fillStyle = 'hsl(100, 50%, 50%)';
      ctx.fill();

    } else {
      ctx.beginPath();
      // ctx.moveTo(this.centerX - 20, this.centerY + 200);
      ctx.arc(this.centerX - 125, this.centerY + 200, 15, 0, 2*Math.PI);
      ctx.fillStyle = 'hsl(100, 50%, 50%)';
      ctx.fill();
    }
  }
}