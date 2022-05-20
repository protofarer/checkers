export default class Button {
  #defaultHandler
  constructor(ctx, buttonData) {
    this.ctx = ctx
    this.rect = this.ctx.canvas.getBoundingClientRect()
    
    this.origin = buttonData.origin
    
    this.label = buttonData.label || 'no-button-label-assigned'

    this.baseWidth = buttonData.base?.w || 70
    this.baseHeight = buttonData.base?.h || 30
    this.stretchWidth = buttonData.stretch?.w || 1
    this.stretchHeight = buttonData.stretch?.h || 1

    this.labelColor = buttonData.labelColor || 'hsl(200, 20%, 30%)'
    this.areaFill = buttonData.areaFill || 'hsl(210,90%,85%)'
    this.borderStroke = buttonData.borderStroke || this.areaFill

    // NTH help functions for top, bot, left, right, center
  }

  setClickArea(offset) {
    // Parent must invoke to enable clickArea and default click handler

    // literal offsets account for the border itself so that clicks that register for
    // this path cover the entirety of button including button border
    this.path = new Path2D()
    // console.log(`setting button ${this.label} at x,y:`, offset.x + this.origin.x - 2, offset.y + this.origin.y - 2 )
    
    this.path.rect(
      offset.x + this.origin.x - 2, 
      offset.y + this.origin.y - 2,
      this.baseWidth * this.stretchWidth + 4,
      this.baseHeight * this.stretchHeight + 4,
    )

    this.#defaultHandler = (e) => {
      console.log(`${this.label} button's default handler coordsX.`, e.clientX - this.rect.left)
      if (this.ctx.isPointInPath(
        this.path,
        e.clientX - this.rect.left, 
        e.clientY - this.rect.top
      )) {
        console.log(`some Button's onclick is undefined`)
      }
    }
    this.ctx.canvas.addEventListener('click', this.#defaultHandler)
  }

  addClickListener(f, options) {
    // Only one click listener, remove default before adding new handler
    // pass in EventTarget.addEventListener options
    
    this.ctx.canvas.removeEventListener('click', this.#defaultHandler)

    // Click detection handled handled here instead of outside of it!
    // Assuming handler listening to canvas
    this.f = f
    this.ctx.canvas.addEventListener('click', this.handleClick.bind(this), options)
  }

  handleClick(e) {
    if (this.ctx.isPointInPath(
      this.path, e.clientX - this.rect.left, e.clientY - this.rect.top
    )) {
      console.log(`woohoo button is clicked`, this.f.name)
      this.f()
    }
  }

  removeClickListener() {
    console.log(`Button removeClickListener invoked`, )
    this.ctx.canvas.removeEventListener('click', this.handleClick)
  }

  draw () {
    // Init clickArea path here because Panel draw does offset for its components
    // and I don't want to pass in more constructor arguments to this button
    // Indeed, the button is oblivious to its environment at large
    // Thus encapsulated and simplified
    this.ctx.strokeStyle = this.borderStroke
    this.ctx.fillStyle = this.areaFill
    this.ctx.lineWidth = 1

    this.ctx.shadowColor = 'hsla(0, 0%, 0%, 0.7)'
    this.ctx.shadowBlur = 7
    this.ctx.shadowOffsetY = 5

    this.ctx.beginPath()
    this.ctx.fillRect(this.origin.x, 
      this.origin.y, 
      this.baseWidth * this.stretchWidth, 
      this.baseHeight * this.stretchHeight
    )
  
    this.ctx.shadowColor = this.ctx.shadowBlur = this.ctx.shadowOffsetY = null

    this.ctx.strokeRect(
      this.origin.x, 
      this.origin.y, 
      this.baseWidth * this.stretchWidth,
      this.baseHeight * this.stretchHeight
    )

    this.ctx.font = '16px Arial'
    this.ctx.fillStyle = this.labelColor
    this.ctx.fillText(`${this.label}`, this.origin.x + 13, this.origin.y + 20)
  }
}