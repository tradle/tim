
const navs = new Map()

module.exports = {
  watch: nav => {
    if (navs.has(nav)) return

    let _currentRoute
    navs.set(nav, {
      get currentRoute() {
        return _currentRoute || nav.state.routeStack[nav.state.presentedIndex]
      }
    })

    nav.navigationContext.addListener('willfocus', function (e) {
      _currentRoute = e.data.route
    })
  },
  getCurrentRoute: nav => {
    var watcher = navs.get(nav)
    if (!watcher) throw new Error('nav not found! Run navs.watch(nav) first')

    return watcher.currentRoute
  }
}
