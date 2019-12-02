const logs = JSON.parse(window.localStorage.getItem('logs') || '[]') || []

function renderLog (log) {
  return `<li>
      <div class="log">${log.text}</div>
      <time datetime="${log.time}">${timeago(log.time)}</time>
    </li>`
}

function renderLogs () {
  const res = logs.slice().reverse().map(renderLog).join('\n')
  document.getElementById('logs').innerHTML = res
}
renderLogs()

setInterval(function () {
  document.querySelectorAll('time').forEach(time => {
    const newTimeago = timeago(time.getAttribute('datetime'))
    if (time.innerText !== newTimeago) time.innerText = newTimeago
  })
}, 1000)

function saveLog ({ time, text }) {
  time = time || new Date()
  logs.push({ time, text })
  window.localStorage.setItem('logs', JSON.stringify(logs))
}

// focus and bring up keyboard (on phone) whatever you do really
const bar = document.getElementById('omnibar')
document.body.addEventListener('click', function (event) {
  if (event.target !== bar) {
    bar.focus()
    bar.click()
  }
}, true)

// on submit
const form = document.getElementById('form')
form.addEventListener('submit', function (e) {
  const text = bar.value
  saveLog({ text })
})
