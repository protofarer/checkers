export default class Button {
  #defaultHandler
  constructor(ctx, origin, label, stretchWidth=1, stretchHeight=1, baseWidth=70, baseHeight=30) {
    this.ctx = ctx
    this.rect = this.ctx.canvas.getBoundingClientRect()
    
    this.origin = origin
    this.label = label

    this.baseWidth = baseWidth
    this.baseHeight = baseHeight
    this.stretchWidth = stretchWidth
    this.stretchHeight = stretchHeight

    this.labelColor = 'black'

    this.path = new Path2D()
    // literals account for the border itself so that clicks that register for
    // this path cover the entirety of button including button border
    this.path.rect(
      this.origin.x - 2, 
      this.origin.y - 2,
      this.baseWidth * this.stretchWidth + 4,
      this.baseHeight * this.stretchHeight + 4,
    )

    this.#defaultHandler = (e) => {
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
    this.ctx.strokeStyle = 'hsl(0, 0%, 25%)'
    this.ctx.fillStyle = 'hsl(0,0%,80%)'
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