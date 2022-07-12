// **********************************************************************
// ********************   Load Audio Assets
// **********************************************************************

export default function initSounds() {
  // eslint-disable-next-line no-unused-vars
  let assetsLoaded = 0

  // Arrayed collection of sounds for randomized selection for play
  //    or ordered, deliberate access (king)
  let sounds = {
    move: [],
    capture: [],
    death: [],
    music: [],
    click: [],
    victory: [],
    king: [],     // 1: kingcrown, 2: kingdeath
    draw: []
  }

  const music1 = document.querySelector('#introMusic1')
  sounds.music.push(music1)
  const music2 = document.querySelector('#introMusic2')
  sounds.music.push(music2)
  const music3 = document.querySelector('#introMusic3')
  sounds.music.push(music3)

  const moveSound1 = document.querySelector('#move1')
  sounds.move.push(moveSound1)
  const moveSound2 = document.querySelector('#move2')
  sounds.move.push(moveSound2)

  const captureSound1 = document.querySelector('#capture1')
  sounds.capture.push(captureSound1)
  const captureSound2 = document.querySelector('#capture2')
  sounds.capture.push(captureSound2)

  const deathSound1 = document.querySelector('#death1')
  sounds.death.push(deathSound1)
  const deathSound2 = document.querySelector('#death2')
  sounds.death.push(deathSound2)
  const deathSound3 = document.querySelector('#death3')
  sounds.death.push(deathSound3)

  const boardClickSound1 = document.querySelector('#boardClick1')
  sounds.click.push(boardClickSound1)
  const boardClickSound2 = document.querySelector('#boardClick2')
  sounds.click.push(boardClickSound2)
  const boardClickSound3 = document.querySelector('#boardClick3')
  sounds.click.push(boardClickSound3)

  const victorySound1 = document.querySelector('#victory1')
  sounds.victory.push(victorySound1)
  const victorySound2 = document.querySelector('#victory2')
  sounds.victory.push(victorySound2)

  const kingcrownSound = document.querySelector('#kingcrown')
  sounds.king.push(kingcrownSound)

  const kingdeathSound = document.querySelector('#kingdeath')
  sounds.king.push(kingdeathSound)

  const drawSound = document.querySelector('#draw')
  sounds.draw.push(drawSound)
  
  const playRandomMusic = playRandomSoundType(sounds.music)

  function loadSounds() {
    for (let soundsOfType of Object.values(sounds)) {
      soundsOfType.forEach(s => {
        s.addEventListener(
          'canplaythrough', 
          soundLoadHandler, 
          { capture: false, once: true }
        )
        s.load()
      })
    }
    
    let randomMusic = playRandomMusic()
    randomMusic.volume = 0.1
  }
  loadSounds()

  function soundLoadHandler() {
    assetsLoaded++
    
    // for (let soundsOfType of Object.values(sounds)) {
    //   soundsOfType.forEach(s => {
    //     s.removeEventListener('canplaythrough', soundLoadHandler, false)
    //   })
    // }


  }

  // **********************************************************************
  // ********************   Sound Play Factories
  // **********************************************************************

  const playRandomDeathSound = playRandomSoundType(sounds.death)

  const playRandomCaptureSound = (disc=null) => {
    // A sequence of attack then death sound for each capture
    // Death sounds differs for kings
    // 
    const playCaptureSound = playRandomSoundType(sounds.capture)
    const captureSound = playCaptureSound(disc)
    // TODO add delay by reacting to animate loop time passed
    //  or using audoEle.ended state
    // setTimeout(playRandomDeathSound(), 1000)
    let deathSound
    captureSound.addEventListener('ended', () => {
      if (disc?.isKing) {
        // kingdeathSound
        sounds.king[1].currentTime = 0
        sounds.king[1].play()
        deathSound = sounds.king[1]
      } else {
        deathSound = playRandomDeathSound()
      }
    }, { once: true })
    return deathSound
  }

  function playRandomSoundType(sounds) {
    return () => {
      const sound = sounds[Math.floor(Math.random() * sounds.length)]
      sound.currentTime = 0
      sound.play()
      return sound
    }
  }

  const playRandomMoveSound = playRandomSoundType(sounds.move)
  const playRandomClickSound = playRandomSoundType(sounds.click)
  const playRandomVictorySound = playRandomSoundType(sounds.victory)
  
  return { 
    sounds, 
    play: {
      playRandomMoveSound, 
      playRandomCaptureSound,
      playRandomVictorySound,
      playRandomMusic,
      playRandomDeathSound,
      playRandomClickSound,
    }
  }
}


