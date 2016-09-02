// will not be necessary when we switch to redux and save all state including history
// and restore from url
if (window.history) {
  if (history.length > 1) {
    history.go(-(history.length - 2))
  }
}

require('./index.common')
