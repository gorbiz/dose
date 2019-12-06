function timeago (ts) {
  const ms = +new Date() - +new Date(ts)
  var seconds = Math.floor(ms / 1000)

  if (!seconds) return 'just now'

  const days = Math.floor(seconds / (3600 * 24))
  seconds -= days * 3600 * 24
  const hours = Math.floor(seconds / 3600)
  seconds -= hours * 3600
  const minutes = Math.floor(seconds / 60)
  seconds -= minutes * 60

  if (days) {
    // ex 1 day & 5 hours ago
    return `${days} days ${hours} hours ago`
  } else {
    // ex 1 hour and 36 minutes ago
    if (!hours && !minutes) return `${seconds} seconds ago`
    if (!hours) return `${minutes} minutes ago`
    return `${hours} hours ${minutes} minutes ago`
  }
}

const logs = JSON.parse(window.localStorage.getItem('logs') || '[]') || []

const topInfo = document.getElementById('top-info')
const firstHintMessage = 'Hint: Start typing for example “coffee” or “meditation”.'
if (!logs.length) {
  topInfo.innerText = firstHintMessage
}

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
  renderLogs()
}

// focus and bring up keyboard (on phone) whatever you do really
const bar = document.getElementById('omnibar')
document.body.addEventListener('click', function (event) {
  if (event.target !== bar) {
    bar.focus()
    bar.click()
  }
}, true)

// on type
bar.addEventListener('input', function (e) {
  if (bar.value) {
    topInfo.innerText = 'Matches:'
  } else {
    topInfo.innerText = logs.length ? '...' : firstHintMessage
  }
})

// on submit
const form = document.getElementById('form')
form.addEventListener('submit', function (e) {
  const text = bar.value
  bar.value = ''
  saveLog({ text })
})
