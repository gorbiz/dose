// TODO rename to app.js

// TODO make this a type='module'(?)
let globalFilter = ''
const bar = document.getElementById('omnibar')
function setOmnibar (value) {
  bar.value = value
  bar.dispatchEvent(new Event('change'))
}

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

const theme = window.localStorage.getItem('theme') || 'auto'
document.querySelector('html').classList.add(theme)

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
function getLenghtClass (text) {
  const n = text.length
  if (n < 30) return 'below30'
  if (n < 35) return 'below35'
  if (n < 100) return 'below' + Math.ceil((n + 1) / 10) * 10
  return 'above100'
}

function renderLog (log) {
  let tpl = document.getElementById('tpl-entry').innerText
  Object.entries(log).map(([name, value]) => {
    if (name === 'text') value = escapeHtml(value) // make possible to display " (quotes) etc.
    tpl = tpl.split(`{${name}}`).join(value)
  })
  tpl = tpl.replaceAll('{lengthClass}', getLenghtClass(log.text))
  const offset = new Date().getTimezoneOffset() * 60 * 1000
  const prettydate = new Date((new Date(log.time) - offset)).toISOString().substr(0, 16).replace('T', ' ')
  tpl = tpl.split('{prettydate}').join(prettydate)
  return tpl
}

const urlParams = new URLSearchParams(window.location.search)
const historySize = Number(urlParams.get('nr') || '100') // NOTE example: /?nr=500               <-- to show up to 500 entries
const startDate = urlParams.get('startDate')             // NOTE example: /?startDate=2021-11-20 <-- to exclude all entried before
const sort = urlParams.get('sort')                       // NOTE example: /?sort                 <-- to sort results alphab. (instead of cron.)

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
  setOmnibar(inp.value)
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
    const themes = ['dark', 'light', 'auto']
    let theme = window.localStorage.getItem('theme') || 'auto'
    theme = themes[(themes.indexOf(theme) + 1) % 3] // cycle, get next theme mode
    document.querySelector('html').classList.remove('dark', 'light', 'auto')
    document.querySelector('html').classList.add(theme)
    window.localStorage.setItem('theme', theme)
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

function updateClass (event) {
  const el = event.target
  const cls = getLenghtClass(el.value)
  if (!el.classList.contains(cls)) {
    el.classList.remove('below30', 'below35', 'below40', 'below50', 'below60', 'below70', 'below80', 'below90', 'below100', 'above100')
    el.classList.add(cls)
  }
}

document.querySelectorAll('input[type="text"]').forEach(el => {
  el.addEventListener('input', updateClass)
  el.addEventListener('change', updateClass)
})

// on type
bar.addEventListener('input', function (e) {
  topInfo.innerText = logs.length ? '' : firstHintMessage
  globalFilter = bar.value.toLowerCase()

  if (/^button (remove|del|delete|rm) /i.test(bar.value)) {
    const indexString = bar.value.replace(/^button (remove|del|delete|rm) /i, '')
    const index = /^[0-9]+/.test(indexString) ? Number(indexString) : -1
    document.querySelectorAll('section#buttons button').forEach((element, i) => {
      element.classList.toggle('selected', index === i)
    })
  }

  renderLogs()
})

// on submit
const form = document.getElementById('form')
form.addEventListener('submit', function (e) {
  e.preventDefault()
  const text = bar.value
  setOmnibar('')
  globalFilter = ''
  if (text.toLowerCase().trim() === 'reload') return window.location.reload(true) // forces service worker refresh
  if (/^button /i.test(text)) {
    execButtonCommand(text)
    renderLogs()
  } else {
    saveLog({ text })
  }
})

function execButtonCommand (text) {
  text = text.replace(/^button /i, '')
  if (/^add quick /i.test(text)) {
    text = text.replace(/^add quick /i, '')
    return addButton({ text, quick: true })
  } else if (/^add /i.test(text)) {
    text = text.replace(/^add /i, '')
    return addButton({ text })
  } else if (/^(remove|del|delete|rm) /i.test(text)) {
    text = text.replace(/^(remove|del|delete|rm) /i, '')
    if (/^all/i.test(text)) {
      return removeAllButtons()
    } else if (/^[0-9]+/i.test(text)) {
      text = text.replace(/^remove /i, '')
      const index = Number(text)
      return removeButton(index)
    }
  } else {
    window.alert('Unrecognized button command')
  }
}

function addButton ({ text, quick = false }) {
  const button = { text, quick }
  const buttons = JSON.parse(window.localStorage.getItem('buttons') || '[]')
  buttons.push(button)
  window.localStorage.setItem('buttons', JSON.stringify(buttons))
  addDOMButton(button)
}

function removeButton (index) {
  const buttons = JSON.parse(window.localStorage.getItem('buttons') || '[]')
  buttons.splice(index, 1)
  window.localStorage.setItem('buttons', JSON.stringify(buttons))
  removeDOMButton(index)
}

function removeAllButtons () {
  window.localStorage.setItem('buttons', JSON.stringify([]))
  document.querySelectorAll('section#buttons button').forEach(element => {
    element.parentNode.removeChild(element)
  })
}

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
  switchView('page-main')
})

document.addEventListener('visibilitychange', () => {
  const { hidden, visibilityState } = document
  console.log('document.visibilitychange:', { hidden, visibilityState })
  // XXX do we need this here?: switchView('page-main')
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
  const buttons = JSON.parse(window.localStorage.getItem('buttons') || '[]')
  buttons.map(addDOMButton)
})

function addDOMButton ({ text, quick }) {
  const el = document.createElement('button')
  el.classList.add('shortcut')
  if (quick) el.classList.add('quick')
  el.innerHTML = text

  el.addEventListener('click', event => {
    const button = event.currentTarget
    const text = button.innerHTML // NOTE button.innerText makes more sense to me, but seems to trim trailing space
    if (button.classList.contains('quick')) {
      saveLog({ text })
    } else {
      setOmnibar(text)
    }
  })

  const buttonsSection = document.querySelector('section#buttons')
  buttonsSection.appendChild(el)
}

function removeDOMButton (index) {
  const buttons = document.querySelectorAll('section#buttons button')
  buttons[index].parentNode.removeChild(buttons[index])
}

// toggle the view, or change to ex: cssClass = 'page-main'
function switchView (cssClass = false) {
  document.querySelectorAll('section.page').forEach(({ classList }) => {
    if (cssClass) return classList.toggle('hidden', !classList.contains(cssClass))
    classList.toggle('hidden')
  })
}

const container = document.querySelector('body')
let initial = { x: null, y: null }

container.addEventListener('touchstart', (e) => {
  if (e.target.tagName === 'INPUT') return
  initial = { x: e.touches[0].clientX, y: e.touches[0].clientY }
})

container.addEventListener('touchmove', (e) => {
  if (e.target.tagName === 'INPUT') return
  if (initial.x === null || initial.y === null) return

  const current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  const diffX = initial.x - current.x
  const diffY = initial.y - current.y
  if (Math.abs(diffX) < Math.abs(diffY)) return // if mostly vertical swipe
  // CONSIDER if (Math.abs(diffX) < threshold) return // if very short swipe -- probably unindended

  console.log(`swiped ${diffX > 0 ? 'left' : 'right'}`, diffX)
  switchView()

  initial = { x: null, y: null }
  // e.preventDefault()
})

// switchView('page-analytics')
