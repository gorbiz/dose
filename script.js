// making pretty timestamps
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
    return `${days} days ${hours} hr ago`
  } else {
    // ex 1 hour and 36 minutes ago
    if (!hours && !minutes) return `${seconds} sec ago`
    if (!hours) return `${minutes} min ago`
    return `${hours} hr ${minutes} min ago`
  }
}

// keeper of all the entries
const logs = JSON.parse(window.localStorage.getItem('logs') || '[]') || []

// hints & texts like "Matches" just below the omnibox
const topInfo = document.getElementById('top-info')
const firstHintMessage = 'Hint: Start typing for example “coffee” or “meditation”.'
if (logs.length) {
  document.getElementById('history').classList.remove('empty')
} else {
  topInfo.innerText = firstHintMessage
}


function renderLog (log) {
  let tpl = document.getElementById('tpl-entry').innerText
  Object.entries(log).map(([name, value]) => {
    tpl = tpl.split(`{${name}}`).join(value)
  })
  return tpl  
}

function renderLogs () {
  const logsEl = document.getElementById('logs')
  const list = logs.slice().reverse().map(renderLog).join('')
  console.log(list)
  logsEl.innerHTML = list
}
renderLogs()



function saveLog ({ time, text }) {
  time = time || new Date()
  logs.push({ time, text })
  window.localStorage.setItem('logs', JSON.stringify(logs))
  renderLogs()
}

// click entry to expand it (for editing and more)
const clickLog = (logElement) => {
  const text = logElement.querySelector('.text').innerText
  const time = logElement.querySelector('time').dateTime
  logElement.classList.toggle('expanded')
}



// tap on things:
//  - expand entries
//  - focus and bring up keyboard (on phone) else is tapped
const bar = document.getElementById('omnibar')
document.body.addEventListener('click', function (event) {
  const target = event.target
  const logItem = target.closest('li.log')
  if (logItem) { // is or har parent element that is an entry
    clickLog(logItem)
    return
  }
  if (target !== bar) {
    bar.focus()
    bar.click()
  }
}, true)



// on type
bar.addEventListener('input', function (e) {
  if (bar.value) {
    topInfo.innerText = 'Matches:'
  } else {
    topInfo.innerText = logs.length ? '' : firstHintMessage
  }
})



// on submit
const form = document.getElementById('form')
form.addEventListener('submit', function (e) {
  const text = bar.value
  bar.value = ''
  saveLog({ text })
})



function updatePrettyDates () {
  document.querySelectorAll('time').forEach(time => {
    const newTimeago = timeago(time.getAttribute('datetime'))
    if (time.innerText !== newTimeago) time.innerText = newTimeago
  })
}
updatePrettyDates()
// update timestamps now and then
setInterval(updatePrettyDates, 1000)
