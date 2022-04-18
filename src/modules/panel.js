import { CONSTANTS } from '../main';

// TODO Panel instances need access to game red and black captures
export default class Panel {
  #resetButtonPath;
  #redPassButtonPath;
  #blackPassButtonPath;
  constructor (width, height, ctx, game) {
    this.ctx = ctx;
    this.game = game;
    this.width = width;     // pixels
    this.height = height;   // pixels
    this.centerX = 800 + 5 + width/2;
    this.centerY = 800/2;
    this.redJailX = 815;
    this.redJailY = 20;
    this.blackJailX = 815;
    this.blackJailY = 790;
    
    this.resetButtonX = this.centerX + 65;
    this.resetButtonY = this.centerY - 15;

    this.#resetButtonPath = new Path2D();
    this.#resetButtonPath.rect(
      this.resetButtonX, 
      this.resetButtonY,
      70, 30
    );

    this.#redPassButtonPath = new Path2D();
    this.#redPassButtonPath.rect(
      this.centerX + 65, 
      this.centerY - 35,
      70, 30
    );
  }
  
  drawPassButton(x, y) {
    this.ctx.beginPath();

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'black';
    this.ctx.fillStyle = 'hsl(0,0%,80%)';
    this.ctx.fillRect(x, y, 70, 30);
    
    
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = 'black';
    this.ctx.fillText('Pass', x + 17, y + 21);
  }

  drawResetButton() {
    this.ctx.beginPath();
    const x = this.resetButtonX;
    const y = this.resetButtonY;
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'black';
    this.ctx.fillStyle = 'hsl(0,0%,80%)';
    this.ctx.fillRect(x, y, 70, 30);
    
    
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = 'black';
    this.ctx.fillText('Reset', x + 13, y + 20);
  }

  isResetClicked(x, y) {
    const isInPath = this.ctx.isPointInPath(this.#resetButtonPath, x , y);
    return isInPath;
  }

  draw() {
    this.drawResetButton()
    this.drawPassButton(this.centerX - 95, this.centerY - 90);
    this.drawPassButton(this.centerX - 95, this.centerY + 60);
    this.ctx.beginPath();
    // WARN hardcoded position
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'rgb(0,0,0,0.5)';
    this.ctx.strokeRect(805, 0, this.width, this.height);

    // Dividing line between players' respective info subpanels
    this.ctx.moveTo(815, 350);
    this.ctx.lineTo(815 + this.width - 20, 350);
    this.ctx.moveTo(815, 450);
    this.ctx.lineTo(815 + this.width - 20, 450);
    this.ctx.stroke();

    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = 'black';
    // Draw red's jail
    this.ctx.fillText(
      `Blacks captured: ${this.game.captures.forRed}`, 
      this.redJailX, 
      this.redJailY
    );

    // Draw black's jail
    this.ctx.fillText(
      `Reds captured: ${this.game.captures.forBlack}`, 
      this.blackJailX, 
      this.blackJailY
    );

    // Red's empty turn indicator
    this.ctx.moveTo(this.centerX - 125 + 16, this.centerY - 75);
    this.ctx.arc(this.centerX - 125, this.centerY - 75, 16, 0, 2*Math.PI);
    // Black's empty turn indicator
    this.ctx.moveTo(this.centerX - 125 + 16, this.centerY + 75);
    this.ctx.arc(this.centerX - 125, this.centerY + 75, 16, 0, 2*Math.PI);
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    if (this.game.turnColor === CONSTANTS.RED) {
      this.ctx.beginPath();
      // this.ctx.moveTo(this.centerX - 20, this.centerY + 20);
      this.ctx.arc(this.centerX - 125, this.centerY - 75, 15, 0, 2*Math.PI);
      this.ctx.fillStyle = 'hsl(100, 50%, 50%)';
      this.ctx.fill();
    } else {
      this.ctx.beginPath();
      // this.ctx.moveTo(this.centerX - 20, this.centerY + 200);
      this.ctx.arc(this.centerX - 125, this.centerY + 75, 15, 0, 2*Math.PI);
      this.ctx.fillStyle = 'hsl(100, 50%, 50%)';
      this.ctx.fill();
    }
  }
}