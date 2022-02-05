// TODO make this a type='module'(?)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
}
