// touch / swipe event stuff...

function findLogFrom (x, y) {
  return document.elementFromPoint(x, y).closest('li.log')
}

document.addEventListener('touchstart', handleTouchStart, false)
document.addEventListener('touchmove', handleTouchMove, false)
document.addEventListener('touchend', handleTouchEnd, false)

var xDown = null
var yDown = null
var logMoving = null
var logXOffset = 0

function getTouches (evt) {
  return evt.touches ||             // browser API
    evt.originalEvent.touches // jQuery
}

function handleTouchStart (evt) {
  const firstTouch = getTouches(evt)[0]
  xDown = firstTouch.clientX
  yDown = firstTouch.clientY
  logMoving = findLogFrom(xDown, yDown)
  if (logMoving) {
    const rect = logMoving.getBoundingClientRect()
    const logStartX = rect.left
    logXOffset = xDown - logStartX
  }
}

function handleTouchMove (evt) {
  console.log('handleTouchMove')
  // if (!xDown || !yDown) return
  console.log('derp')

  var xUp = evt.touches[0].clientX
  var yUp = evt.touches[0].clientY

  var xDiff = xDown - xUp
  var yDiff = yDown - yUp

  // NOTE don't show movement start until after a while?
  if (Math.abs(xDiff) > 30) {
    logMoving.classList.add('moving')
  }

  // if (Math.abs(yDiff) > Math.abs(xDiff)) return // ignore vertical swipes

  logMoving.style.left = `${xUp - logXOffset}px`
  if (xDiff > 0) {
    // left swipe
  } else {
    // right swipe
  }
  // reset values
  xDown = null
  yDown = null
}

function handleTouchEnd (evt) {
  logMoving.classList.remove('moving')
}
