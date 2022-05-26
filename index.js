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