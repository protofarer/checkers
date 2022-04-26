import { CONSTANTS } from '../main';

export default class Panel {
  #resetButtonPath;
  #redPassButtonPath;
  #redPassButtonX;
  #redPassButtonY;
  #blackPassButtonPath;
  #blackPassButtonX;
  #blackPassButtonY;
  
  constructor (width, height, ctx) {
    this.ctx = ctx;

    this.width = width;     // pixels
    this.height = height;   // pixels
    this.centerX = 800 + 5 + width/2;
    this.centerY = 800/2;

    this.separatorUpperY = this.centerY - 38;
    this.separatorLowerY = this.centerY + 38;
    
    this.redJailX = 815;
    this.redJailY = 20;

    this.blackJailX = 815;
    this.blackJailY = 790;

    this.turnIndicatorX = this.centerX - 75;
    this.turnIndicatorY = this.centerY;
    
    this.resetButtonX = this.centerX - 40;
    this.resetButtonY = this.centerY - 15;
    this.#resetButtonPath = new Path2D();
    this.#resetButtonPath.rect(
      this.resetButtonX, 
      this.resetButtonY,
      70, 30
    );

    this.#redPassButtonX = this.centerX - 40
    this.#redPassButtonY = this.centerY - 90;
    this.#redPassButtonPath = new Path2D();
    this.#redPassButtonPath.rect(
      this.#redPassButtonX, 
      this.#redPassButtonY,
      70, 30
    );

    this.#blackPassButtonX = this.centerX - 40;
    this.#blackPassButtonY = this.centerY + 60;
    this.#blackPassButtonPath = new Path2D();
    this.#blackPassButtonPath.rect(
      this.#blackPassButtonX, 
      this.#blackPassButtonY,
      70, 30
    );
  }
  
  drawPassButton(x, y, playerColor, turnColor) {
    this.ctx.beginPath();

    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'black';
    this.ctx.fillStyle = 'hsl(0,0%,80%)';
    this.ctx.fillRect(x, y, 70, 30);
    
    
    this.ctx.font = '16px Arial';
    turnColor === playerColor
      ? this.ctx.fillStyle = 'blue'
      : this.ctx.fillStyle = 'grey'
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
    return this.ctx.isPointInPath(this.#resetButtonPath, x , y);
  }

  isRedPassClicked(x, y) {
    return this.ctx.isPointInPath(this.#redPassButtonPath, x, y);
  }
  
  isBlackPassClicked(x, y) {
    return this.ctx.isPointInPath(this.#blackPassButtonPath, x, y);
  }

  draw({ captures, turnColor }) {
    this.drawResetButton()
    this.drawPassButton(
      this.#redPassButtonX, this.#redPassButtonY, 
      CONSTANTS.RED, turnColor
    );
    this.drawPassButton(
      this.#blackPassButtonX, this.#blackPassButtonY, 
      CONSTANTS.BLACK, turnColor
    );

    // Topmost panel container
    this.ctx.beginPath();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'rgb(0,0,0,0.5)';
    // WARN hardcoded position
    this.ctx.strokeRect(805, 0, this.width, this.height);

    // Dividing line between players' respective info subpanels
    this.ctx.moveTo(815, this.separatorUpperY);
    this.ctx.lineTo(815 + this.width - 20, this.separatorUpperY);
    this.ctx.moveTo(815, this.separatorLowerY);
    this.ctx.lineTo(815 + this.width - 20, this.separatorLowerY);
    this.ctx.stroke();

    // Draw red's jail
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(
      `Blacks captured: ${captures.forRed}`, 
      this.redJailX, 
      this.redJailY
    );

    // Draw black's jail
    this.ctx.fillText(
      `Reds captured: ${captures.forBlack}`, 
      this.blackJailX, 
      this.blackJailY
    );

    // Red's empty turn indicator
    this.ctx.moveTo(this.turnIndicatorX + 16, this.turnIndicatorY - 75);
    this.ctx.arc(
      this.turnIndicatorX, 
      this.turnIndicatorY - 75, 
      16, 0, 2*Math.PI
    );

    // Black's empty turn indicator
    this.ctx.moveTo(this.turnIndicatorX + 16, this.turnIndicatorY + 75);
    this.ctx.arc(
      this.turnIndicatorX, 
      this.turnIndicatorY + 75, 16, 0, 2*Math.PI);
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    this.ctx.beginPath();
    turnColor === CONSTANTS.RED
      ? this.ctx.arc(this.turnIndicatorX, this.centerY - 75, 15, 0, 2*Math.PI)
      : this.ctx.arc(this.turnIndicatorX, this.centerY + 75, 15, 0, 2*Math.PI)
    this.ctx.fillStyle = 'hsl(100, 50%, 50%)';
    this.ctx.fill();
  }
}
