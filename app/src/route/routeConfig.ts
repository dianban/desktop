import { App } from '../ui/a0'
import { a1Route } from '../ui/a1'
// import commonRoute from '../features/common/route';
// import examplesRoute from '../features/examples/route';
import lodash from 'lodash'

// NOTE: DO NOT CHANGE the 'childRoutes' name and the declaration pattern.
// This is used for Rekit cmds to register routes config for new features, and remove config when remove features, etc.
const childRoutes: any = [a1Route]

const routes = [
  {
    path: '/',
    component: App,
    childRoutes: [...childRoutes].filter(
      r => r.component || (r.childRoutes && r.childRoutes.length > 0)
    ),
  },
]

// Handle isIndex property of route config:
//  Dupicate it and put it as the first route rule.
function handleIndexRoute(route: any) {
  if (!route.childRoutes || !route.childRoutes.length) {
    return
  }

  const indexRoute = lodash.find(route.childRoutes, child => child.isIndex)
  if (indexRoute) {
    const first = { ...indexRoute }
    first.path = ''
    first.exact = true
    first.autoIndexRoute = true // mark it so that the simple nav won't show it.
    route.childRoutes.unshift(first)
  }
  route.childRoutes.forEach(handleIndexRoute)
}

routes.forEach(handleIndexRoute)
export default routes
