import { resetGame } from '../main.js'

export default function setupExternalUI(id) {
  const container = document.createElement('div')
  container.id = id
  document.body.appendChild(container)

  const canvas = document.createElement('canvas')
  container.appendChild(canvas)

  container.appendChild(document.createElement('hr'))
  
  const infoWrapper = document.createElement('div')
  container.appendChild(infoWrapper)
  infoWrapper.style.display = 'flex'
  infoWrapper.style.gap = '30px'
  
  const statusEle = document.createElement('div')
  statusEle.id = 'status'
  statusEle.style.width = '300px'
  infoWrapper.appendChild(statusEle)
  

  // const debugButton = document.createElement('button')
  // debugButton.id = 'debugButton'
  // debugButton.innerText = 'toggle\ndebug\n...'
  // infoWrapper.appendChild(debugButton)
  
  // const debugEle = document.createElement('div')
  // debugEle.id = 'debug'
  // infoWrapper.appendChild(debugEle)
  
  // const boardStateEle = document.createElement('div')
  // boardStateEle.id = 'boardState'
  // boardStateEle.style.border = '1px dotted blue'
  // boardStateEle.style.fontSize = '12px'
  // infoWrapper.appendChild(boardStateEle)

  // const resetButton = document.createElement('button')
  // resetButton.innerText = 'reset\nboard'
  // infoWrapper.appendChild(resetButton)

  // const debugResetButton = document.createElement('button')
  // debugResetButton.innerText = 'debug\nreset\nboard'
  // infoWrapper.appendChild(debugResetButton)

  // const debugKingButton = document.createElement('button')
  // debugKingButton.innerText = 'toggle\nkings'
  // infoWrapper.appendChild(debugKingButton)

  // const debugVictoryButton = document.createElement('button')
  // debugVictoryButton.innerText = 'trigger victory'
  // infoWrapper.appendChild(debugVictoryButton)
  
  // resetButton.addEventListener('click', () => {
  //   resetGame()
  // })
  
  // debugResetButton.addEventListener('click', () => {
  //   resetGame(true)
  // })

  document.addEventListener('keydown', handleKeydown)
  function handleKeydown(e) {
    if (e.key === '`') {
      resetGame(true)
    } else if (e.key === '~') {
      resetGame(false)
    }
  }


  function updateAll(game) {
    // function updateDebugEle() {
    //   debugEle.innerHTML = `\
    //     <span>
    //       client: ${game.mouseCoords.client.x},${game.mouseCoords.client.y} <br />
    //       canvas: ${game.mouseCoords.canvas.x},${game.mouseCoords.canvas.y}<br />
    //       board: ${Math.floor(parseFloat(game.mouseCoords.board.x))}, ${game.mouseCoords.board.y}<br />
    //       col,row: ${Math.floor((parseFloat((game.mouseCoords.board.x)/100,2).toFixed(2))) }, ${Math.floor(parseFloat((game.mouseCoords.board.y)/100,2).toFixed(2))}<br />
    //       rectpos: ${Math.floor(game.rect.left)},${Math.floor(game.rect.top)}<br />
    //       canvas w,h: ${canvas.width},${canvas.height}<br />
    //       phase: ${game.phase}<br />
    //       winner: ${game.winner}
    //     </span>
    //   `
    // }

    // function updateBoardStateEle() {
    //   boardStateEle.innerHTML = `\
    //     <span>${game.boardToHTML()}</span>\
    //   `
    // }

    function updateStatusEle() {
      statusEle.innerHTML = `\
        <strong>Status:</strong> <br />
        Message: ${game.msg} <br />
        Turns: ${game.turnCount} <br />
        <strong>Match:</strong> <br />
        \
      `
        // Red victories: ${game.match.red.wins} <br />
        // Black victories: ${game.match.black.wins} <br />
    }

    updateStatusEle()
    // updateDebugEle()
    // updateBoardStateEle()
  }

  return {
    // debugEle, boardStateEle, debugButton, resetButton, 
    // debugResetButton, debugKingButton, debugVictoryButton,
    canvas,
    statusEle, 
    updateAll,
  }
}