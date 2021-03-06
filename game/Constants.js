
export default {
  BLANK: 0,
  BLACK: 1,
  RED: 2,
  GHOST: 3,
  PHASE_SETUP: 4,
  PHASE_PLAY: 5,
  PHASE_END: 6,
  BOARD_INIT_DEBUG: [ 
    [0,0,0,0,0,0,0,0],
    [1,0,0,0,2,0,2,0],
    [0,2,0,0,0,0,0,0],
    [2,0,0,0,2,0,0,0],
    [0,0,0,0,0,1,0,1],
    [0,0,0,0,1,0,0,0],
    [0,1,0,0,0,1,0,2],
    [0,0,0,0,0,0,0,0]
  ],
  BOARD_INIT_PROD: [ 
    [0,2,0,2,0,2,0,2],
    [2,0,2,0,2,0,2,0],
    [0,2,0,2,0,2,0,2],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [1,0,1,0,1,0,1,0],
    [0,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,0],
  ],
}