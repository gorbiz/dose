// TODO rename to app.js

// TODO make this a type='module'(?)
let globalFilter = ''
const bar = document.getElementById('omnibar')

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

function escapeHtml (unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function renderLog (log) {
  let tpl = document.getElementById('tpl-entry').innerText
  Object.entries(log).map(([name, value]) => {
    if (name === 'text') value = escapeHtml(value) // make possible to display " (quotes) etc.
    tpl = tpl.split(`{${name}}`).join(value)
  })
  const offset = new Date().getTimezoneOffset() * 60 * 1000
  const prettydate = new Date((new Date(log.time) - offset)).toISOString().substr(0, 16).replace('T', ' ')
  tpl = tpl.split('{prettydate}').join(prettydate)
  return tpl
}

const urlParams = new URLSearchParams(window.location.search)
const historySize = Number(urlParams.get('nr') || '100') // NOTE example: /?nr=500               <-- to show up to 500 entries
const startDate = urlParams.get('startDate')             // NOTE example: /?startDate=2021-11-20 <-- to exclude all entried before
const sort = urlParams.get('sort')                       // NOTE example: /?sort                 <-- to sort results alphab. (instead of cron.)
console.log({ sort })
function renderLogs () {
  const logsEl = document.getElementById('logs')
  let filtered = logs.slice()
  if (startDate) filtered = filtered.slice().filter(log => log.time >= startDate)
  let matched = !globalFilter ? filtered.slice() : filtered.filter(log => log.text.toLowerCase().includes(globalFilter))
  const matchedCount = matched.length

  const uniq = {}
  matched.forEach(m => { uniq[m.text] = (uniq[m.text] || 0) + 1 })
  const uniqCount = Object.keys(uniq).length

  let text = `${matchedCount.toLocaleString('se')} Found, ${uniqCount.toLocaleString('se')} unique`
  if (matchedCount > historySize) text += ` <span style='opacity: 0.33;'> showing the first ${historySize}</span>`
  document.querySelector('#history .title').innerHTML = text

  matched = (sort !== null) ? matched.sort((a, b) => a.text > b.text ? 1 : -1 ) : matched.reverse()
  const list = matched.slice(0, historySize).map(renderLog).join('')
  logsEl.innerHTML = list
}
renderLogs()

function saveLog ({ time, text }) {
  time = (time || new Date()).toISOString()
  logs.push({ time, text })
  saveLogs()
}

function saveLogs () {
  window.localStorage.setItem('logs', JSON.stringify(logs))
  renderLogs()
}

// click entry to expand it (for editing and more)
const clickLog = (logElement, target) => {
  const inp = target.matches('input') ? target : logElement.querySelector('input')
  // console.log({ logElement, target })
  bar.value = inp.value
  // if (bar !== document.activeElement) bar.focus() // <-- breaks interaction on phone :/
  // return
  // TODO if double tap:
  if (!logElement.classList.contains('expanded')) {
    // remove expanded from all other items first
    document.querySelectorAll('li.log').forEach((miscLog) => {
      if (miscLog !== logElement) miscLog.classList.remove('expanded')
    })
    logElement.classList.add('expanded')
  }
  if (inp !== document.activeElement) { // isn't focused
    inp.focus()
    inp.selectionStart = inp.selectionEnd = inp.value.length // move carret to the end (or where it previously was)
  }
}

// tap on things:
//  - expand entries
//  - focus and bring up keyboard (on phone) else is tapped
document.body.addEventListener('click', function (event) {
  const target = event.target
  const logItem = target.closest('li.log')
  if (logItem) { // is or have parent element that is an entry
    clickLog(logItem, target)
    return
  }
  if (target.closest('.toggle')) {
    document.querySelector('html').classList.toggle('dark')
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
  topInfo.innerText = logs.length ? '' : firstHintMessage
  globalFilter = bar.value.toLowerCase()
  renderLogs()
})

// on submit
const form = document.getElementById('form')
form.addEventListener('submit', function (e) {
  e.preventDefault()
  const text = bar.value
  bar.value = ''
  globalFilter = ''
  saveLog({ text })
})

// on edit entry
function editEntry (event) {
  const target = event.target
  const li = target.parentElement
  const input = target.querySelector('input')
  const original = {
    time: li.getAttribute('data-time'),
    text: li.getAttribute('data-text')
  }
  const edited = {
    time: li.getAttribute('data-time'),
    text: input.value
  }
  updateEntry(original, edited)
  input.blur()
  li.classList.remove('expanded')
}

function updateEntry (original, edited) {
  for (let i = logs.length; i > 0; --i) {
    if (JSON.stringify(original) == JSON.stringify(logs[i])) {
      logs[i] = edited
      saveLogs()
      return
    }
  }
}

// remove entries
function removeEntry (event) {
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
  document.querySelectorAll('time.ago').forEach(time => {
    const newTimeago = timeago(time.getAttribute('datetime'))
    if (time.innerText !== newTimeago) time.innerText = newTimeago
  })
}
updatePrettyDates()
// ...now and then
setInterval(updatePrettyDates, 1000)

window.addEventListener('focus', function () {
  // when switching to application open the on-screen keyboard, blur + focus seems to do it (for Android)
  console.log('focus (window) event fired...')
  document.getElementById('omnibar').blur()
  document.getElementById('omnibar').focus()
})

// const tagCount = {}
// logs.map(log => log.text).forEach(txt => {
//   (txt.match(/#[.a-z0-9_-]+/ig) || []).forEach(tag => { tagCount[tag] = (tagCount[tag] || 0) + 1 })
// })
// const tags = Object.keys(tagCount).sort()
// showTags({ tags, filter: '' })

// function showTags({ tags, filter }) {
//   filter = filter.toLowerCase()
//   // const t = tags.filter(tag => tag.startsWith('#' + filter))
//   const t = tags.filter(tag => tag.toLowerCase().includes(filter))
//   const html = t.map(tag => `<option value="${tag}">${tag} (${tagCount[tag]})</option>`).join('\n')
//   console.log(html)
//   document.getElementById('pet-select').innerHTML = html
// }

window.addEventListener('DOMContentLoaded', (event) => {
  document.querySelectorAll('button.shortcut').forEach(button => {
    button.addEventListener('click', event => {
      bar.value = event.currentTarget.innerHTML
    })
  })
})