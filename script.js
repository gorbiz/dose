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

// touch / swipe event stuff...

// function findLogFrom (x, y) {
//   return document.elementFromPoint(x, y).closest('li.log')
// }

// document.addEventListener('touchstart', handleTouchStart, false)
// document.addEventListener('touchmove', handleTouchMove, false)
// document.addEventListener('touchend', handleTouchEnd, false)

// var xDown = null
// var yDown = null
// var logMoving = null
// var logXOffset = 0

// function getTouches (evt) {
//   return evt.touches ||             // browser API
//     evt.originalEvent.touches // jQuery
// }

// function handleTouchStart (evt) {
//   const firstTouch = getTouches(evt)[0]
//   xDown = firstTouch.clientX
//   yDown = firstTouch.clientY
//   logMoving = findLogFrom(xDown, yDown)
//   if (logMoving) {
//     const rect = logMoving.getBoundingClientRect()
//     const logStartX = rect.left
//     logXOffset = xDown - logStartX
//   }
// }

// function handleTouchMove (evt) {
//   console.log('handleTouchMove')
//   // if (!xDown || !yDown) return
//   console.log('derp')

//   var xUp = evt.touches[0].clientX
//   var yUp = evt.touches[0].clientY

//   var xDiff = xDown - xUp
//   var yDiff = yDown - yUp

//   // NOTE don't show movement start until after a while?
//   if (Math.abs(xDiff) > 30) {
//     logMoving.classList.add('moving')
//   }

//   // if (Math.abs(yDiff) > Math.abs(xDiff)) return // ignore vertical swipes

//   logMoving.style.left = `${xUp - logXOffset}px`
//   if (xDiff > 0) {
//     // left swipe
//   } else {
//     // right swipe
//   }
//   // reset values
//   xDown = null
//   yDown = null
// }

// function handleTouchEnd (evt) {
//   logMoving.classList.remove('moving')
// }



const logs = JSON.parse(window.localStorage.getItem('logs') || '[]') || []

const topInfo = document.getElementById('top-info')
const firstHintMessage = 'Hint: Start typing for example “coffee” or “meditation”.'
if (!logs.length) {
  topInfo.innerText = firstHintMessage
}

function renderLog (log) {
  return `<li class="log">
      <div class="text">${log.text}</div>
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
