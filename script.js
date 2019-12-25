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

const urlParams = new URLSearchParams(window.location.search)
const historySize = Number(urlParams.get('nr') || '100')
function renderLogs () {
  const logsEl = document.getElementById('logs')
  const list = logs.slice().reverse().slice(0, historySize).map(renderLog).join('')
  logsEl.innerHTML = list
}
renderLogs()



function saveLog ({ time, text }) {
  time = time || new Date()
  logs.push({ time, text })
  saveLogs()
}

function saveLogs () {
  window.localStorage.setItem('logs', JSON.stringify(logs))
  renderLogs()
}

// click entry to expand it (for editing and more)
const clickLog = (logElement, target) => {
  if (!logElement.classList.contains('expanded')) {
    // remove expanded from all other items first
    document.querySelectorAll('li.log').forEach((miscLog) => {
      if (miscLog != logElement) miscLog.classList.remove('expanded')
    })
    logElement.classList.add('expanded')
  }
  let inp = null
  if (target.matches('input')) {
    inp = target
  } else {
    inp = logElement.querySelector('input')
  }
  if (inp !== document.activeElement) { // isn't focused
    inp.focus()
    inp.selectionStart = inp.selectionEnd = inp.value.length // move carret to the end (or where it previously was)
  }
}



// tap on things:
//  - expand entries
//  - focus and bring up keyboard (on phone) else is tapped
const bar = document.getElementById('omnibar')
document.body.addEventListener('click', function (event) {
  const target = event.target
  const logItem = target.closest('li.log')
  if (logItem) { // is or har parent element that is an entry
    clickLog(logItem, target)
    return
  }
  if (target !== bar) {
    bar.focus()
    bar.click()
  }

  document.querySelectorAll('li.log').forEach((miscLog) => {
    miscLog.classList.remove('expanded')
  })

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

// on edit entry
function editEntry (event) {
  const target = event.target
  const li = target.parentElement
  const input = target.querySelector('input')
  const original = {
    text: li.getAttribute('data-text'),
    time: li.getAttribute('data-time') }
  const edited = {
    text: input.value,
    time: li.getAttribute('data-time') }
  updateEntry(original, edited)
  input.blur()
  li.classList.remove('expanded')
}

function updateEntry(original, edited) {
  for (const log of logs) {
    if (JSON.stringify(original) == JSON.stringify(log)) {
      log = edited
      saveLogs()
      return
    }
  }
}



// remove entries
function removeEntry(event) {
  const target = event.target
  const li = target.closest('li')
  const text = li.getAttribute('data-text')
  const time = li.getAttribute('data-time')
  for (let i = 0; i < logs.length; i++) {
    if (logs[i].text === text && logs[i].time === time) {
      logs.splice(i, 1)
      saveLogs()
      return
    }
  }
}



// update timestamps now and then
function updatePrettyDates () {
  document.querySelectorAll('time').forEach(time => {
    const newTimeago = timeago(time.getAttribute('datetime'))
    if (time.innerText !== newTimeago) time.innerText = newTimeago
  })
}
updatePrettyDates()
// ...now and then
setInterval(updatePrettyDates, 1000)
