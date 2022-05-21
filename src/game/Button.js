export default class Button {
  // I. Principles
  //  A. The most common and simple button, persistent and unreactive
  //  When used it persistently consumes space on the screen
  //  and invokes a function when clicked
  // II. Properties:
  //  A. positions and dimensions
  //  B. visual styling
  //  C. a default click handler that's overwritten with explicit handler
  //  D. click detection based on mouse client coords (scroll not implemented)
  //  E. sensible defaults for properties
  // III. Methods:
  //  A. add an click listener that can be passed with addEventListener options
  //  B. remove the added clickListener
  //  C. draw
  //  D. set its own path aka clickArea

  #defaultHandler
  constructor(ctx, buttonData, offset) {
    this.ctx = ctx
    this.offset = offset
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

    this.setPath()
    this.controller = new AbortController()
    this.setClickHandler()
    // NTH help functions for top, bot, left, right, center
  }

  setPath() {
    this.path = new Path2D()
    // console.log(`setting button ${this.label} at x,y:`, offset.x + this.origin.x - 2, offset.y + this.origin.y - 2 )
    
    this.path.rect(
      this.offset.x + this.origin.x - 2, 
      this.offset.y + this.origin.y - 2,
      this.baseWidth * this.stretchWidth + 4,
      this.baseHeight * this.stretchHeight + 4,
    )
  }

  setClickHandler() {
    // Invoked upon Button initialization

    // literal offsets account for the border itself so that clicks that register for
    // this path cover the entirety of button including button border

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
    this.ctx.canvas.addEventListener(
      'click', 
      this.#defaultHandler, 
    )
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
      this.f()
    }
  }

  removeClickListener() {
    console.log(`Button removeClickListener invoked`, )
    this.ctx.canvas.removeEventListener('click', this.handleClick)
  }

  draw() {
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
    // Finagling with centering the text here, making estimates based on
    // 16pt font size equivalent in pixels, see label.length * [numeric literal]
    this.ctx.fillText(`${this.label}`, 
      (this.origin.x + (this.baseWidth * this.stretchWidth / 2) - (this.label.length*8/2)), this.origin.y + 20
    )
  }
}