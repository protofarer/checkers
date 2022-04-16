export default class Board {
  static draw(ctx) {
    const boardHue = 45;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        ctx.beginPath();
        if (( row + col) % 2 === 0) {
          ctx.fillStyle = `hsl(${boardHue}, 100%, 85%)`;
          ctx.fillRect(col * 100, row * 100, 100, 100);
        } else {
          ctx.fillStyle = `hsl(${boardHue}, 50%, 50%)`;
          ctx.fillRect(col * 100, row * 100, 100, 100);
        }
      }
    }
  }
}