const formEle = document.querySelector('form')

formEle.addEventListener('submit', (e) => {
  e.preventDefault()
  new FormData(formEle)
  window.location.assign('game/')
})

formEle.addEventListener('formdata', (e) => {
  let data = e.formData
  for (let [key, val] of data.entries()) {
    window.sessionStorage.setItem(key, val)
  }
})


const settingsMusic = document.querySelector('#settingsMusic')
settingsMusic.addEventListener('canplaythrough', loadHandler, false)
settingsMusic.load()

function loadHandler() {
  settingsMusic.removeEventListener('canplaythrough', loadHandler, false)
  settingsMusic.play()
  settingsMusic.volume = 0.3
}
// CSDR import.meta.env.DEV && options to start game in prod or debug