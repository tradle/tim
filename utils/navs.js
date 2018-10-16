
const navs = new Map()

const navUtils = {
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
  },

  getCurrentRouteInfo: nav => {
    const route = navUtils.getCurrentRoute(nav)
    const routes = nav.getCurrentRoutes()
    return {
      routes,
      route,
      index: routes.indexOf(route)
    }
  }
}

module.exports = navUtils
